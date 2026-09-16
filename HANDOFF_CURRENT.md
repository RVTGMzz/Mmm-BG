# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the last explicitly user-accepted HOST-authoritative rollback baseline.

Validated rollback artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, stale-token protection, movement-actor camera lock, Jail/Hospital release semantics, or final-result/podium/rematch flow.

Visible vocabulary remains **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.68.x

Current presentation/stabilization family: **0.1.68.x**.

Manual status: **PENDING RON ACCEPTANCE**.

Purpose: stop adding new systems long enough to make one complete match reliable and readable:

`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

The 0.1.68.x line is stabilization/presentation work. It deliberately adds no new gameplay RNG or alternative authority path.

## 3. Runtime chain

`START_PLAYTEST.bat` activates the current 0.1.68.x presentation wrapper above the validated authority chain.

Core inheritance remains rooted in:
`068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

Later 0.1.68.x presentation wrappers must remain authority-free.

## 4. One visible build identity

Source of truth:
`src/buildInfo.ts`

Menu, Setup, Roll For Order and board read visible build copy from `MEMEME_BUILD` instead of hard-coding different historical MVP numbers.

Do not reintroduce scene-local visible version strings.

## 5. Pregame vertical slice

Canonical entry flow:
1. Menu / Local Lobby;
2. Face Setup;
3. dedicated **CHỌN LUẬT CHƠI** screen;
4. choose `1 / 2 / 3 LƯỢT`, corresponding to `1 / 2 / 3 VÒNG / NGƯỜI`;
5. authoritative Roll For Order;
6. start canonical board runtime.

The picker reuses existing authoritative `targetLaps` state. It does not create a second match-length system.

## 6. JOB modal isolation

Human screenshots showed legacy Job/result/HUD text bleeding outside the canonical dark Job popup.

0.1.68.x presentation wrappers must suppress unrelated legacy/result/HUD text while a blocking Job or other canonical modal owns focus, then restore normal HUD visibility after the modal closes.

Safety:
- no `Math.random`;
- no direct MatchState mutation;
- no new `submitIntent` path;
- no gameplay/economy rule change.

Manual screenshot/runtime confirmation is still required. CI cannot prove pixel-perfect overlap visually.

## 7. Mobile / Steam Deck retained

Retained from the 0.1.66–0.1.68.x chain:
- logical game remains 1280×720 with Phaser FIT;
- dynamic mobile viewport handling uses `100dvh / 100dvw`;
- scale refreshes on resize/orientation/`visualViewport`/fullscreen changes;
- mobile fullscreen shortcut is icon-only: `⛶` when windowed, `↙` when fullscreen;
- shortcut sits under the Settings gear and hides while Settings is open;
- browser/Steam Deck gamepad UI navigation remains installed.

Landscape fullscreen is the preferred mobile test mode, but fullscreen still requires a user gesture where browsers enforce it.

## 8. Endgame / rematch retained

Inherited result flow remains authoritative and covered by regression tests:
- final result transition;
- podium ranking/ties;
- reaction/winner spotlight;
- low-to-high reveal cadence;
- result controls unlock only after reveal;
- `CHƠI LẠI 🔁` resets and begins a clean match;
- `VỀ LOBBY` returns to the lobby flow.

## 9. 0.1.68 integration guards

The 0.1.68 test family protects against accidental regression of:
- canonical visible version source;
- `Menu → Setup → rules → Roll → board` scene chain;
- real 1/2/3-lap finish semantics;
- Job/modal isolation;
- Podium/Rematch/Lobby controls;
- mobile fullscreen/viewport and Steam Deck gamepad wiring;
- CI coverage for CPU stress and deterministic long-match simulation.

The historical 0.1.48 bugfix test is rebased only where obsolete visible-label assertions need to follow the current build. Its authority/no-RNG/stale-token/release guards remain intact.

## 10. Public web deployment

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher has exact-SHA CI gating, current-branch-HEAD gating and concurrency protection. Do not weaken those guards.

## 11. Manual acceptance checklist

Ron should validate the web/packaged runtime, preferably mobile landscape fullscreen plus a desktop/Steam Deck pass:
1. Menu, Setup, rules screen and Roll For Order use the current canonical build identity;
2. 1 / 2 / 3 LƯỢT selection works and matches 1 / 2 / 3 target laps;
3. Roll For Order stays inside its frame;
4. Job/result/news/card modals do not leak unrelated text behind or outside the modal;
5. several Job interactions do not break remaining movement;
6. multiple Jail/Hospital release cycles do not freeze or double-roll;
7. CPU autoplay remains healthy over a long match;
8. mobile fullscreen icon stays below Settings and does not cover the HUD;
9. DOM overlays stay aligned with the Phaser canvas in landscape/fullscreen;
10. match reaches Podium at the selected target length;
11. `CHƠI LẠI` starts a clean match and `VỀ LOBBY` returns correctly;
12. keep watching the historical long-run token snap-back issue.

Do **not** call the 0.1.68.x family user-accepted until Ron manually validates the runtime.

## 12. Mandatory canonical UI / UX design contract

**This section is a permanent project rule, not a temporary 0.1.68 fix.**

Canonical source:
`docs/CANONICAL_UI_UX_RULES.md`

CI guard:
`tests/canonical-ui-ux-contract.ts`

Every current and future MeMeMe screen, HUD, modal, popup, card, touch flow, keyboard flow and controller/Steam Deck flow must follow that contract unless Ron explicitly approves an exception.

Core rules include:
- mobile readability is the baseline;
- summary first, detail on demand;
- normal persistent HUD targets at most three readable information lines;
- idle player cards stay compact;
- active-turn player card expands and may reveal one extra contextual line;
- active state cannot rely on colour alone;
- Job Hub default cards stay concise and detailed Job data opens deliberately via touch/click/controller/keyboard;
- blocking modal owns attention and suppresses unrelated HUD/narration;
- no text may leak outside its owner surface;
- floating bubbles/tooltips must remain inside viewport safe bounds;
- shorten/remove/move detail before reducing font size;
- touch, controller and keyboard must reach equivalent core actions/details;
- presentation work must not introduce RNG, alternate authority paths or duplicate gameplay state.

When a new UI becomes crowded, **do not shrink text first**. Remove duplicate information, shorten copy, move details behind interaction, reorganize layout, and only then adjust typography modestly.

This contract exists specifically to prevent MeMeMe from returning to dense tiny-text HUDs and requiring another global readability rewrite later.

## 13. Next development direction — 0.1.68.2

Before content-depth work, implement the canonical UI contract end-to-end in **0.1.68.2**:
- compact idle player HUD;
- expanded active-turn player HUD;
- compact Job Hub cards;
- Job detail popup opened deliberately by touch/click/controller/keyboard;
- strict modal ownership/overlay suppression;
- reaction/floating bubble viewport containment and text clamping;
- cleanup of remaining text that jumps outside its frame.

After 0.1.68.2 is manually accepted, continue content depth without violating the canonical UI/UX contract.

Do not merge PR #1.
