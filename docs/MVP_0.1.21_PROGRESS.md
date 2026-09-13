# MeMeMe MVP 0.1.21 — Settings & Audio Startup

Status: ACTIVE / BUILDING

## Changes

### Compact Settings panel

The permanent exposed BGM/volume/FX HUD is no longer installed from `main.ts`.

New global DOM shell:
- `src/ui/SettingsPanel.ts`
- `src/settings.css`

Only a compact `⚙️` trigger remains visible. The panel contains:
- BGM on/off;
- BGM volume;
- FX on/off;
- reserved Game section for future display/speed/accessibility preferences.

Settings remain client-only presentation preferences and do not enter gameplay-critical state.

### Faster Menu BGM startup

`bgmController.start()` now runs before Phaser game creation and immediately:
1. installs the browser autoplay unlock gesture;
2. prepares `menu_mememe` with `preload = auto` + explicit `load()`;
3. selects the Menu track before LobbyScene creation.

The first track uses a short 100ms fade-in while normal track transitions keep the existing fade behavior.

This does not bypass browser autoplay policy. If audio is blocked until a user gesture, the gesture now unlocks an already-created/loading Menu Audio element instead of waiting for LobbyScene to create it.

### Regression

New command:

`npm run test:settings`

Locks:
- `bgmController.start()` before `new Phaser.Game()`;
- early Menu prepare/select behavior;
- short initial fade path;
- Settings gear exists;
- BGM toggle + volume + FX toggle exist;
- legacy exposed `installBgmControls` is not installed from `main.ts`.

## Retained 0.1.20 features

- board-first compact HUD;
- turn halo;
- pip dice;
- distance-aware step movement;
- Card/News/Reaction timing;
- odd/even auto routing;
- face editor + runtime compression;
- approved four-track BGM source files unchanged.

## Invariants

- Do not merge PR #1 unless Ron explicitly asks.
- Do not re-encode approved BGM files.
- Do not put audio/settings preferences into MatchState/checksum.
- Browser autoplay policy is respected; no hidden fake user gesture or silent workaround.
