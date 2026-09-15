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

## 2. Current candidate — MVP 0.1.66

**0.1.66 — Unified Flow + Match Length + Mini Game Readability + Mobile/Release Hotfix**

Manual status: **PENDING RON ACCEPTANCE**.

Latest human runtime feedback driving the hotfix portion:
1. the public mobile web build renders the 1280×720 game too small inside the phone browser instead of using the actually visible viewport well;
2. in 1-human + 3-CPU play, the match appeared frozen after a CPU succeeded at Jail release and the `ĐƯỢC THẢ!` presentation finished.

0.1.66 also retains the planned unified launcher, selectable 1/2/3-lap match length and Mini Game readability work.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene066 as ActiveBoardScene`

Inheritance:
`066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

Setup/header copy identifies `PLAYTEST MVP 0.1.66`.

## 4. Mobile viewport / fullscreen fix

0.1.66 keeps the game logic at 1280×720 so hitboxes, camera math and input coordinates do not get distorted, but makes the browser container follow the real visible mobile viewport.

Implemented:
- `src/mobileViewport066.css` uses dynamic viewport units (`100dvh` / `100dvw`);
- `index.html` uses `viewport-fit=cover`, disables accidental page zoom and opts into visible-widget resizing;
- `src/main.ts` refreshes Phaser FIT sizing on normal resize, orientation changes, `visualViewport` resize/scroll and fullscreen changes;
- Settings now exposes a real **TOÀN MÀN HÌNH** button using the browser Fullscreen API.

Android browsers require fullscreen to originate from a user gesture, so the Settings button is intentional rather than attempting to force fullscreen automatically.

Expected manual result in landscape: the game should occupy substantially more of the usable phone screen; tapping **TOÀN MÀN HÌNH** should remove normal browser chrome where the browser permits it.

Regression is covered by `tests/unified-flow-match-length-066.ts`.

## 5. CPU release-resume freeze protection

Authoritative Jail/Hospital gameplay rules are **unchanged**:
- a release D6 only decides release;
- on success, `specialHold` clears while the player remains at TÙ/BV;
- the release D6 is discarded;
- the same player must then roll a fresh movement D6;
- that fresh D6 traverses the real Jail/Hospital penalty corridor.

Human runtime showed a presentation/autoplay handoff gap: after the release-success presentation clears, a CPU can be back at `PRE_ROLL_ACTION` with `lastRoll=null` in the same turn but fail to visibly resume, making the match look frozen.

New helper:
`src/core/cpuReleaseResume066.ts`

`pendingCpuFreshRollAfterRelease066(...)` only arms when all of these are true:
- latest relevant event is a successful `special_release` for the current player;
- current actor is a configured CPU seat;
- phase is `PRE_ROLL_ACTION`;
- `lastRoll === null`;
- hold has actually been cleared;
- presentation is no longer blocking;
- this release event sequence has not already been handled.

`CareerMinigameBoardScene066` then submits exactly one normal `roll` intent through the existing HOST-authoritative path.

Safety:
- no `Math.random`;
- no second RNG stream;
- no direct match-state mutation;
- no HOST bypass;
- source event sequence prevents double-submit;
- no submit while a blocking presentation is active.

The historical 0.1.48 regression was updated only to allow this one guarded executable submit; broad authority protection remains intact.

## 6. Unified launcher + selectable match length

0.1.66 ships one normal playtest launcher:
- keep `START_PLAYTEST.bat`;
- do not ship the old Draft D preview/full-map launchers.

The historical preview engine remains in source for deterministic QA/regression only.

Setup now offers **1 / 2 / 3 VÒNG**.
- 1 lap preserves legacy checksum shape;
- 2/3-lap targets are authoritative and checksummed;
- finish/retirement logic uses each player's target laps.

Mini Game presentation is reflowed for readability while retaining HOST-system payout ownership and deterministic rules.

## 7. Retained 0.1.65.1 / 0.1.65 presentation-input fixes

Still retained:
- rounded UI proxy ghost cleanup;
- browser/Steam Deck gamepad navigation using existing pointer handlers;
- authoritative Job title/level/salary HUD;
- unemployed = `Chưa có nghề` / `0 B$/vòng`;
- hidden always-on debug footer;
- direct dice remains suppressed while Card target flow is open.

0.1.63.2 movement-actor camera lock remains the human-confirmed camera baseline beneath this build.

## 8. Retained 0.1.64 gameplay baseline

Board/gameplay remains on the 0.1.64 deterministic foundation except for selectable target-lap count:
- expanded ~2340×1020 board;
- 1.5× round spaces;
- real Jail corridor `100 -> 101 -> 102 -> 103 -> 12`;
- real Hospital corridor `110 -> 111 -> 112 -> 113 -> 34`;
- J1/J2/J3/H1/H2/H3 = `-20 B$` on landing;
- Card SFX gain 0.80, Step 1.30;
- Job mid-roll continuation retained;
- HOST odd/even branch routing retained.

The 32-match deterministic QA batch remains a regression baseline rather than a balance verdict. Current 0.1.64-derived fingerprints in CI include the release-corridor sentinels and must only be deliberately rebased after an intentional gameplay change.

## 9. Green 0.1.66 code/test checkpoint

Code/test HEAD before this handoff-doc commit:
`fdecf86206d655945e5b789ae6a9efab2e245d64`

Main push CI:
- run `#2473` / `35010767981`;
- **FULL SUITE SUCCESS**;
- all authority, replay, multiplayer, historical regression, 0.1.66, face-transform and package-validation steps passed.

Artifact:
- `mememe-playtest-0.1.66-unified-flow-match-length`;
- artifact ID `10414015335`;
- size `8,597,042 bytes`;
- SHA256 `e794a90f8c38605d57229263d9de6ca1e427f2e854e293b002db1361e4a49831`;
- expires `2026-09-29T18:59:04Z`.

Production Vite bundle from this checkpoint:
- JS `assets/index-18fZ1c7p.js`;
- CSS `assets/index-H5khdwyb.css`.

After these handoff docs are committed, run the full push CI again and record the exact docs-inclusive HEAD/run/artifact before calling the checkpoint finalized.

## 10. Web deployment status

Private-repo web workflow for the same green runtime SHA:
- `MeMeMe Steam Deck Web Playtest` run `#39` / `35010767705`;
- build/artifact SUCCESS;
- deploy skipped because GitHub Pages is not enabled for the private repository.

The public test URL Ron has been using is:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Public mirror repository:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

At the time of this handoff update, its committed `index.html` still references the older compiled bundle:
- `assets/index-BqZUERzh.js`;
- `assets/index-LXsjZvVl.css`.

A cross-repository artifact sync attempt was added but failed at artifact download because a public repository `GITHUB_TOKEN` cannot read artifacts from the private `MeMeMe-BoardGame` repository. Do not claim the public URL contains 0.1.66 until its committed `index.html` is verified to reference the 0.1.66 bundle and the Pages deployment succeeds.

Do not commit temporary signed artifact URLs or credentials to either repository.

## 11. Manual validation checklist for Ron

Use the 0.1.66 artifact and, once verified deployed, the public web build.

Priorities:
1. mobile landscape fills the usable viewport much better than the screenshot from the older web build;
2. Settings -> **TOÀN MÀN HÌNH** enters browser fullscreen where supported;
3. reproduce several Jail/Hospital holds and confirm a CPU does not freeze after `ĐƯỢC THẢ!`;
4. successful CPU release visibly proceeds to a fresh movement D6 only after release presentation clears;
5. no double-roll or skipped turn after release;
6. 1/2/3-lap picker works and the match ends at the selected target;
7. Mini Game UI remains readable;
8. rounded popup backings do not become orphan panels;
9. controller/gamepad behavior still works;
10. camera remains centered on the visible mover;
11. continue watching the historical long-run token snap-back issue.

Do **not** call 0.1.66 user-accepted until Ron manually validates the runtime behavior above.

0.1.49 Legacy Effect Audit remains historical input only.

Do not merge PR #1.
