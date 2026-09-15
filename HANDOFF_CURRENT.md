# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the only user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token protection, camera movement-actor lock, or READY/lap/final-result/podium flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.65.1

**0.1.65.1 — Steam Deck Hotfix: UI Ghost Cleanup + Gamepad Navigation + Web Build**

Human feedback after 0.1.65:
1. a large black rounded panel could remain stuck on the board after the owning popup closed;
2. Steam Deck/controller should be able to navigate and confirm gameplay UI without a mouse;
3. Ron wants a GitHub-hosted web build for Steam Deck testing.

Manual status: **PENDING RON ACCEPTANCE**.

This remains a presentation/input hotfix on top of 0.1.65. Gameplay, RNG, HOST authority, economy, routing and camera are unchanged.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0651 as ActiveBoardScene`

Inheritance:
`0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

Build header:
`CITY • MVP 0.1.65.1 • STEAM DECK HOTFIX`.

## 4. Rounded UI ghost root cause and fix

0.1.65 replaces square Rectangle visuals with rounded `Graphics` proxies while retaining the original Rectangle as a near-transparent hitbox.

Human runtime exposed two lifecycle gaps:
- the proxy stored its creation-time visual alpha, so an owning popup could fade/hide the source while the proxy stayed visible;
- when the source object became inactive/destroyed, the map entry could disappear without explicitly destroying the proxy Graphics.

0.1.65.1 fixes both paths in `CareerMinigameBoardScene065.ts`:
- `visualAlpha` mirrors later source alpha changes;
- proxy visibility requires the source to remain visible and visual alpha > 0.01;
- when the source is inactive, the proxy Graphics is explicitly destroyed before removing the map entry;
- Text-background rounded proxies get the same inactive-source cleanup;
- scene shutdown explicitly destroys all remaining rounded proxies.

Expected result: Card/Job/Roll For Order/News/Mini Game/modal backings must disappear with their owner and must never remain as a black/cream orphan panel over the board.

Regression:
`tests/ui-ghost-gamepad-web-0651.ts`.

## 5. Global gamepad / Steam Deck UI navigation

New module:
`src/ui/gamepadUiNavigation0651.ts`

Uses the browser standard Gamepad API and reuses existing Phaser pointer handlers rather than creating a second gameplay path.

Standard mapping:
- D-pad Up = button 12;
- D-pad Down = button 13;
- D-pad Left = button 14;
- D-pad Right = button 15;
- A / confirm = button 0.

Behavior:
- recursively discovers currently visible, active, interactive UI objects with `pointerdown` handlers;
- ignores large backdrop rectangles;
- only navigates the highest active UI layer;
- D-pad changes focus and emits existing `pointerover` / `pointerout` feedback;
- A emits the existing `pointerdown` action.

This is intentionally generic so it can cover the direct dice, Card hand, Card target picker, Tactical Choice, Job Hub, lobby/setup buttons, and other pointer-driven Phaser UI without rewriting each gameplay feature.

Safety:
- no `Math.random`;
- no new RNG stream;
- no direct `submitIntent`/HOST bypass;
- gameplay remains owned by the existing handlers and authority chain.

Manual controller validation is still required on actual Steam Deck hardware.

## 6. 0.1.65 presentation retained

Player/CPU HUD still shows authoritative career data from `jobs_mvp.json`:
- actual Job title;
- current Job level;
- current salary;
- unemployed = `Chưa có nghề` / `0 B$/vòng`.

Rounded presentation remains for:
- all four player cards;
- Rectangle-based panels/buttons;
- Text objects with square background colors.

The red always-visible PLAYTEST/debug footer remains hidden. The result-screen local playtest report remains available.

The Card-target direct-dice hotfix remains active: direct dice is hidden/non-clickable for the entire Card UI flow while `cardPickerOpen=true`.

## 7. 0.1.64 gameplay retained unchanged

Board:
- ~2340 x 1020 footprint;
- 1.5x round spaces;
- minimum measured clearance 15 px.

Jail/Hospital release:
- success clears hold but stays on TÙ/BV;
- release D6 is discarded;
- fresh movement D6 is required same turn;
- fresh D6 traverses the actual J/H corridor.

Corridors:
- Jail `100 -> 101 -> 102 -> 103 -> 12`;
- Hospital `110 -> 111 -> 112 -> 113 -> 34`.

Internal penalties:
- J1/J2/J3/H1/H2/H3 = `-20 B$` on landing only.

Audio:
- Card draw/play `0.80`;
- Step `1.30`.

Camera remains the human-confirmed-good 0.1.63.2 movement-actor lock and is untouched by 0.1.65.1.

Job mid-roll continuation and HOST odd/even branch routing remain unchanged.

## 8. Deterministic gameplay baseline remains 0.1.64

Because 0.1.65.1 only changes presentation/input, active gameplay fingerprints are deliberately not rebased.

32-match deterministic checksum remains:
- `2fca6e9d`.

Active exact sentinels remain:
- seed `611102` -> checksum `1dd42c7c`, 92 turns, 145 commands, finish IDs `[3,2,1,0]`;
- seed `611113` -> checksum `856548f4`, 51 turns, spread 367 B$, finish IDs `[3,0,2,1]`.

Push CI run #2406 passed the full suite with these fingerprints unchanged.

## 9. Green 0.1.65.1 candidate before docs-inclusive run

Code/web candidate at HEAD `3ee37e98a0415e2b2ab5b2d69ffba8a1a93688c0`:

Main CI:
- push run `#2406` / `35000958076`;
- **67/67 meaningful CI steps PASS**;
- artifact `mememe-playtest-0.1.65.1-steamdeck-hotfix`;
- artifact ID `10410130708`;
- size `8,597,189 bytes`;
- SHA256 `7bc61ce6fa94fceb40a182fead5432044632f114849011d37f169b6d64452fab`;
- expires 2026-09-29.

Steam Deck web workflow:
- run `#5` / `35000958074`;
- workflow conclusion **SUCCESS**;
- production Vite build succeeds;
- standalone artifact `mememe-steamdeck-web-dist`;
- artifact ID `10409557987`;
- size `8,594,498 bytes`;
- SHA256 `0ddad7fefeb38427c689cdc580ba392ce81d3f9103e443dd68b7a9919190297f`;
- expires 2026-09-29.

## 10. GitHub Pages / Steam Deck URL status

The web production build is ready, but the repository does **not yet have GitHub Pages enabled**.

Two direct deploy attempts proved the blocker is repository administration, not the game build:
- Pages API returned site-not-found when Pages was disabled;
- automatic enablement failed with `Resource not accessible by integration` because the connected GitHub App/Actions token does not have repository Administration permission.

The workflow is now graceful:
- always builds production `dist`;
- always uploads `mememe-steamdeck-web-dist`;
- tries `configure-pages` without failing the workflow;
- deploys only once Pages is enabled.

Ron must perform this one-time GitHub UI action:
`Repository Settings -> Pages -> Build and deployment -> Source: GitHub Actions`

After that, trigger any new push/workflow run and the same workflow will deploy the Steam Deck web build. Do not claim a live Pages URL until a deploy job actually succeeds.

## 11. Manual test checklist

Use `docs/PLAYTEST_0.1.65.1_STEAM_DECK_HOTFIX.md`.

Verify especially:
1. reproduce the flow from the screenshot: the large dark rounded popup backing disappears completely after the popup closes;
2. repeatedly open/close Card, target, Job and other modals and watch for any orphan panel;
3. on Steam Deck/controller, D-pad moves focus between visible choices;
4. A confirms the focused UI element;
5. controller works on dice, Card hand, Card target, Tactical Choice, Job Hub and setup/lobby buttons;
6. hover/focus feedback remains visible;
7. mouse input still works normally;
8. Card target modal still never shows direct dice behind it;
9. camera remains centered during long rolls;
10. 0.1.64 release corridor and Job continuation remain correct;
11. continue watching for long-run token snap-back.

Do **not** call 0.1.65.1 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input only.

Do not merge PR #1.
