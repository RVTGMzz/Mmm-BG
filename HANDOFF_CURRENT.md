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

## 2. Current candidate — MVP 0.1.68

**0.1.68 — Vertical Slice Stabilization**

Manual status: **PENDING RON ACCEPTANCE**.

Purpose: stop adding new systems long enough to make one complete match reliable:

`Menu → Setup → Chọn luật → Roll For Order → Trận → Podium → Rematch`

0.1.68 is a stabilization/presentation pass. It deliberately adds no new gameplay RNG or alternative authority path.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene068 as ActiveBoardScene`

Inheritance:
`068 -> 067 -> 066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## 4. One visible build identity

New source of truth:
`src/buildInfo.ts`

Current visible version:
`0.1.68`

Menu, Setup, Roll For Order and board now read their visible build copy from `MEMEME_BUILD` instead of hard-coding different historical MVP numbers.

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

`CareerMinigameBoardScene068` now runs a presentation-only guard after inherited updates. While the canonical Job modal is active it temporarily hides matching noncanonical Job description/result/salary text outside the modal, then restores the original visibility after the modal closes.

Safety:
- no `Math.random`;
- no direct MatchState mutation;
- no new `submitIntent` path;
- no gameplay/economy rule change.

Manual screenshot/runtime confirmation is still required. CI cannot prove pixel-perfect overlap visually.

## 7. Mobile / Steam Deck retained

Retained from the 0.1.66–0.1.67 hotfix chain:
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

## 9. New 0.1.68 integration guard

`tests/vertical-slice-068.ts` protects the candidate against accidental regression of:
- canonical 0.1.68 visible version source;
- `Menu → Setup → rules → Roll → board` scene chain;
- real 1/2/3-lap finish semantics;
- Job modal isolation;
- Podium/Rematch/Lobby controls;
- mobile fullscreen/viewport and Steam Deck gamepad wiring;
- CI coverage for CPU stress and deterministic long-match simulation.

The historical 0.1.48 bugfix test was rebased only where it had obsolete visible-label assertions. Its authority/no-RNG/stale-token/release guards remain intact.

## 10. Green functional checkpoint before this handoff-doc commit

Source SHA:
`7aed259ce1c7fc28478095b3a2f8eb1ba3201acc`

Main push CI:
- run `#2531` / `35058626805`;
- **FULL SUITE SUCCESS**;
- compile/typecheck, replay, lockstep, authority, CPU autoplay, Podium/Rematch, full-match simulation, historical regressions, 0.1.68 integration gate, package validation and artifact upload all PASS.

Artifact:
- `mememe-playtest-0.1.68-vertical-slice`;
- artifact ID `10431816769`;
- size `8,599,672 bytes`;
- SHA256 `0be10364a286b3d454df488d3efca76385487ae840356e771d2300134211944e`;
- expires `2026-09-30T05:13:57Z`.

After this handoff documentation commit, use the branch HEAD and its exact-SHA CI result as the docs-inclusive checkpoint. Do not assume a docs-only commit is green until verified.

## 11. Public web deployment

Publisher for source `7aed259...`:
- `Publish compiled web mirror` run `#24` / `35058626777`;
- **SUCCESS**.

Public mirror:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

Public mirror commit:
`6127238874f9ec390cada84647df23e366726bbf`

Commit message:
`Publish compiled MeMeMe web playtest 7aed259`

Public bundle at that checkpoint:
- JS `assets/index-CJFcCihn.js`;
- CSS `assets/index-DdQGOELg.css`.

GitHub Pages:
- run `#17` / `35058735057`;
- **SUCCESS**.

Public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Publisher has exact-SHA CI gating, current-branch-HEAD gating and concurrency protection. Do not weaken those guards.

## 12. Manual acceptance checklist

Ron should validate the web/packaged runtime, preferably mobile landscape fullscreen plus a desktop/Steam Deck pass:
1. Menu, Setup, rules screen and Roll For Order all visibly identify 0.1.68 where version is shown;
2. 1 / 2 / 3 LƯỢT selection works and matches 1 / 2 / 3 target laps;
3. Roll For Order stays inside its frame;
4. Job popup no longer leaks legacy description/result/salary text behind or outside the modal;
5. several Job interactions do not break remaining movement;
6. multiple Jail/Hospital release cycles do not freeze or double-roll;
7. CPU autoplay remains healthy over a long match;
8. mobile fullscreen icon stays below Settings and does not cover the HUD;
9. DOM overlays stay aligned with the Phaser canvas in landscape/fullscreen;
10. match reaches Podium at the selected target length;
11. `CHƠI LẠI` starts a clean match and `VỀ LOBBY` returns correctly;
12. keep watching the historical long-run token snap-back issue.

Do **not** call 0.1.68 user-accepted until Ron manually validates the runtime above.

## 13. Next development direction

If 0.1.68 is manually accepted, use it as the new playable vertical-slice baseline. The planned next pass is content depth, not another architecture rewrite: deepen TIN TỨC / LÁ BÀI / Job / Mini Game variety while preserving this full-match flow.

Do not merge PR #1.
