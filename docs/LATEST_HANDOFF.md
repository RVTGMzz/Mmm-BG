# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, human-confirmed camera movement-actor lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.65.1 — Steam Deck Hotfix**

Human feedback driving this hotfix:
- 0.1.65 could leave a large black rounded UI backing stuck over the board after its popup closed;
- controller/Steam Deck should navigate choices and confirm them;
- Ron wants a GitHub-hosted web test build.

Manual status: **PENDING RON ACCEPTANCE**.

0.1.65.1 changes presentation/input only. Gameplay remains exactly on the 0.1.64 deterministic baseline.

## Runtime

`CareerMinigameBoardScene0651 as ActiveBoardScene`

Inheritance:
`0651 -> 065 -> 064 -> 0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## UI ghost fix

Root cause: 0.1.65 rounded `Graphics` proxies could outlive or ignore the fade state of their source Rectangle/Text.

Fix in `CareerMinigameBoardScene065.ts`:
- proxy alpha follows later source alpha changes;
- proxy hides when source is hidden/faded;
- source inactive/destroyed explicitly destroys its proxy;
- scene shutdown destroys all remaining proxies;
- same cleanup applies to rounded Text-background proxies.

Regression: `tests/ui-ghost-gamepad-web-0651.ts`.

## Gamepad / Steam Deck input

New `src/ui/gamepadUiNavigation0651.ts` uses standard browser Gamepad API mapping:
- D-pad Up/Down/Left/Right = buttons 12/13/14/15;
- A/confirm = button 0.

It discovers the highest active interactive Phaser UI layer and reuses existing handlers:
- D-pad emits existing `pointerover` / `pointerout`;
- A emits existing `pointerdown`.

Therefore it does not create a second gameplay path, RNG stream, or authority bypass. It is intended to cover direct dice, Card hand/target, Tactical Choice, Job Hub, lobby/setup and other pointer-driven UI.

Actual Steam Deck hardware validation is still required.

## Retained 0.1.65 polish

- player/CPU cards show authoritative Job name, level and salary;
- unemployed shows `Chưa có nghề` / `0 B$/vòng`;
- Rectangle panels/buttons and Text-background badges stay rounded;
- red always-visible PLAYTEST/debug footer stays hidden;
- Card target picker still suppresses direct dice.

## Gameplay retained

0.1.64 remains unchanged:
- expanded board and 1.5x spaces;
- Jail/Hospital release succeeds in place, then fresh D6 traverses real corridor;
- J1/J2/J3/H1/H2/H3 = `-20 B$` on landing;
- Card gain 0.80, Step 1.30;
- Job continuation and HOST odd/even branches retained;
- 0.1.63.2 camera remains untouched and human-confirmed good.

Deterministic fingerprints remain:
- 32-match checksum `2fca6e9d`;
- seed 611102 checksum `1dd42c7c`;
- seed 611113 checksum `856548f4`.

## Green code/web candidate before docs-inclusive run

HEAD `3ee37e98a0415e2b2ab5b2d69ffba8a1a93688c0`.

Main CI:
- push run `#2406` / `35000958076`;
- **67/67 PASS**;
- artifact `mememe-playtest-0.1.65.1-steamdeck-hotfix`;
- artifact ID `10410130708`;
- SHA256 `7bc61ce6fa94fceb40a182fead5432044632f114849011d37f169b6d64452fab`.

Steam Deck web workflow:
- run `#5` / `35000958074`;
- **SUCCESS**;
- production Vite build succeeds;
- artifact `mememe-steamdeck-web-dist`;
- artifact ID `10409557987`;
- SHA256 `0ddad7fefeb38427c689cdc580ba392ce81d3f9103e443dd68b7a9919190297f`.

## GitHub Pages blocker

There is not yet a live browser URL because GitHub Pages is disabled for the private repository and the connected integration cannot change repository Administration settings.

One-time manual action required from Ron:
`Repository Settings -> Pages -> Build and deployment -> Source: GitHub Actions`

The Pages workflow is already prepared. Until Pages is enabled it remains green, builds `dist`, uploads `mememe-steamdeck-web-dist`, and skips deployment. After Pages is enabled, a new run will deploy automatically.

Do not claim a live Pages URL until deploy succeeds.

## Manual check

Use `docs/PLAYTEST_0.1.65.1_STEAM_DECK_HOTFIX.md`.

Focus on:
- the black rounded orphan panel from the screenshot no longer remains after popup close;
- repeated popup open/close does not leave any proxy behind;
- D-pad moves selection and A confirms on Steam Deck/controller;
- mouse remains functional;
- camera, Card target dice suppression, Jail/Hospital corridor and Job continuation remain correct.

Do not call 0.1.65.1 accepted until Ron validates runtime behavior.

Do not merge PR #1.
