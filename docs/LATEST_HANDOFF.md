# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.21 — Settings & Audio Startup (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.21`**.

Read first:
1. `docs/MVP_0.1.21_PROGRESS.md`
2. `docs/PLAYTEST_0.1.21.md`
3. `src/ui/SettingsPanel.ts`
4. `src/settings.css`
5. `src/audio/bgmController.ts`
6. `src/main.ts`
7. `tests/settings-audio-021.ts`
8. `docs/MVP_0.1.20_PROGRESS.md`
9. `src/scenes/PresentationParityBoardScene.ts`
10. `src/ui/MatchPresentationLayer.ts`
11. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Why 0.1.21 exists

Real playtest feedback after 0.1.20 identified two UX issues:

1. permanent BGM/volume/FX controls still occupied the upper-right corner;
2. Menu BGM could take roughly 2–3 seconds to become audible because the Menu track was only selected once LobbyScene had already been created.

0.1.21 moves audio preferences into a compact Settings shell and prepares Menu BGM before Phaser scene creation.

## Settings panel

The old exposed `installBgmControls()` HUD is no longer installed from `main.ts`.

The normal screen now shows only a compact `⚙️` trigger. Opening it reveals:
- BGM on/off;
- BGM volume;
- FX on/off;
- a reserved Game section for future display/speed/accessibility preferences.

Panel behavior:
- close with `×`;
- close with `Esc`;
- close by clicking outside;
- panel DOM consumes its own pointer events so Settings interaction does not become a board Roll/Card click.

BGM and FX preferences remain local client preferences. They are not gameplay-critical state and do not enter MatchState/checksum.

## Faster Menu BGM startup

`bgmController.start()` now runs before `new Phaser.Game(config)` and immediately:
1. installs the browser autoplay unlock listeners;
2. creates/preloads `menu_mememe` with `preload = auto` and explicit `load()`;
3. selects the Menu track before LobbyScene exists.

The first track uses a short 100ms fade-in. Normal round-to-round BGM transitions keep their existing fade behavior.

### Browser autoplay rule

0.1.21 does **not** bypass browser autoplay policy.

If Chrome/Edge/mobile allows autoplay, Menu BGM can begin as soon as the preloaded media is ready.

If the browser blocks autoplay until a gesture, the first click/touch/key now unlocks an Audio element that is already created/loading, instead of waiting for LobbyScene to create the track after the gesture.

## Regression

New command:

`npm run test:settings`

It locks:
- BGM startup occurs before Phaser game creation;
- Menu track is prepared and selected from `BgmController.start()`;
- initial fast fade path exists;
- Settings gear exists;
- BGM toggle, BGM volume and FX toggle exist;
- legacy exposed `installBgmControls` is not installed from `main.ts`.

All previous replay, lockstep, host/client, authority, two-tab, CPU stress, presentation, flow, board-flow, board-feel, image and package/BGM checksum checks remain active.

## Current artifact status

Validated run:

`34754009578` / run `#475`

Artifact:

`mememe-playtest-0.1.21`

Artifact digest:

`sha256:5f64f5662f896d3eb768f6c692481b1d9cc126bcc3fbe6ec17c3b6649591dfdb`

Artifact size: ~8.50 MB.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34754009578`

CI passed through artifact upload, including **Settings and early Menu BGM startup**.

## Existing 0.1.20 behavior retained

- board-first compact HUD;
- active-turn halo;
- compact player status;
- graphical pip dice;
- distance-aware step movement;
- Card/News/Reaction timing and side dialogue;
- odd/even route selection;
- result screen deferral;
- BGM round sync protection during presentation;
- face editor and runtime compression.

## Recommended next work

First validate 0.1.21:
1. Settings trigger feels unobtrusive on Lobby/Setup/Board;
2. Settings interactions never trigger gameplay behind the panel;
3. BGM mute/volume and FX mute persist correctly;
4. Menu BGM feels noticeably faster than 0.1.20;
5. on autoplay-blocking browsers, first gesture starts the preloaded Menu track promptly.

If accepted, continue toward content/gameplay depth rather than adding more permanent HUD:
- expand Card/News pool;
- improve reaction/personality variety;
- strengthen tile identity;
- later add more client preferences inside the existing Settings shell instead of new floating controls.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not fake/bypass browser autoplay policy.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put Settings/BGM/SFX/image preferences into gameplay-critical MatchState.
- Presentation eventLog remains excluded from gameplay checksum.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Dice presentation must display the authoritative result.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
