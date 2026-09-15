# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, the human-confirmed movement-actor camera lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.66 — Unified Flow + Match Length + Mini Game Readability + Mobile/Release Hotfix**

Manual status: **PENDING RON ACCEPTANCE**.

Latest human feedback:
- mobile public web build looked too small inside the browser viewport;
- a 1-human + 3-CPU match appeared frozen immediately after a CPU received the `ĐƯỢC THẢ!` Jail-release popup.

## Runtime

`CareerMinigameBoardScene066 as ActiveBoardScene`

Inheritance:
`066 -> 0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Mobile fix

0.1.66 keeps the logical game at 1280×720 but fits against the actually visible phone viewport:
- `src/mobileViewport066.css` uses `100dvh` / `100dvw`;
- `index.html` uses `viewport-fit=cover` and mobile-safe viewport options;
- `src/main.ts` refreshes Phaser scale after resize/orientation/`visualViewport`/fullscreen changes;
- Settings includes a user-gesture **TOÀN MÀN HÌNH** button using `requestFullscreen()`.

The fullscreen button is intentional because Android/browser fullscreen normally requires direct user interaction.

## CPU release-resume watchdog

Release rules are unchanged. A successful Jail/Hospital release still:
1. clears the hold;
2. leaves the player at TÙ/BV;
3. discards the release D6;
4. requires a fresh movement D6 in the same turn;
5. uses that fresh D6 through the real penalty corridor.

New `src/core/cpuReleaseResume066.ts` detects the narrow state where a CPU has successfully released, presentation has fully cleared, the actor is back at `PRE_ROLL_ACTION`, `lastRoll=null` and the hold is cleared.

`CareerMinigameBoardScene066` then wakes exactly one normal HOST `roll` intent. It does not mutate authoritative state directly, add RNG, bypass HOST authority, submit beneath a blocking presentation, or double-submit the same release event.

## Other 0.1.66 work

- one shipped gameplay launcher: `START_PLAYTEST.bat`;
- old Draft D preview/full-map launchers are not shipped;
- historical preview engine remains in source for QA only;
- Setup offers authoritative/checksummed **1 / 2 / 3 VÒNG**;
- Mini Game presentation reflow is retained for readability;
- 0.1.65.1 rounded-proxy cleanup and gamepad navigation remain;
- 0.1.65 Job/salary HUD remains;
- 0.1.64 release corridors and economy/audio behavior remain;
- 0.1.63.2 movement-actor camera lock remains untouched.

## Green code/test checkpoint

Runtime/code SHA before docs update:
`fdecf86206d655945e5b789ae6a9efab2e245d64`

Main CI:
- push run `#2473` / `35010767981`;
- **FULL SUITE SUCCESS**;
- 0.1.66 gate, historical regressions, authority/replay, package validation and artifact upload all PASS.

Artifact:
- `mememe-playtest-0.1.66-unified-flow-match-length`;
- ID `10414015335`;
- `8,597,042 bytes`;
- SHA256 `e794a90f8c38605d57229263d9de6ca1e427f2e854e293b002db1361e4a49831`;
- expires 2026-09-29.

Compiled web bundle:
- `assets/index-18fZ1c7p.js`;
- `assets/index-H5khdwyb.css`.

These handoff docs now need an exact-HEAD docs-inclusive CI run before the checkpoint is considered finalized.

## Web status

Private web workflow for `fdecf862...`:
- run `#39` / `35010767705`;
- production build SUCCESS;
- deployment skipped because Pages is not enabled on the private repository.

Ron’s existing public URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

Public repo:
`ronvotri/ronvotri-MeMeMe-Web-Playtest`

At this checkpoint the committed public `index.html` is still the old bundle:
- `assets/index-BqZUERzh.js`;
- `assets/index-LXsjZvVl.css`.

The first automated cross-repo sync failed because the public repo `GITHUB_TOKEN` cannot read private-repo Actions artifacts. Do not claim the public URL is 0.1.66 until its committed index references the new bundle and Pages deployment is verified.

Never commit a temporary signed artifact URL or credential to git.

## Manual focus

Ron should validate:
- mobile landscape sizing and real fullscreen;
- no freeze after multiple CPU Jail/Hospital releases;
- exactly one fresh movement D6 after release;
- no double-roll/skipped turn;
- 1/2/3-lap ending;
- readable Mini Game UI;
- no rounded UI ghost panels;
- gamepad still works;
- camera remains centered;
- continue watching long-run token snap-back.

Do not call 0.1.66 accepted until Ron validates it.

Do not merge PR #1.
