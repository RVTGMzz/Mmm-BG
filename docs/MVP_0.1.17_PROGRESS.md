# MeMeMe MVP 0.1.17 — Progress Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Status: **ACTIVE / EXTERNAL PLAYTEST PACKAGED**. Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.17 goal

Playtest Feedback + Presentation Parity + BGM Integration.

Audio and visual presentation must not alter gameplay-critical checksum state, command authority, seeded RNG behavior, or replay outcomes.

## BGM source-of-truth

Exact approved source bundle:

`MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:

`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Approved source files and hashes:

| Runtime ID | Source file | Runtime file | SHA-256 |
|---|---|---|---|
| `menu_mememe` | `01_Menu_MeMeMe_LOOP.ogg` | `01_Menu_MeMeMe.ogg` | `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e` |
| `city_bubble` | `02_City_Bubble_LOOP.ogg` | `02_City_Bubble.ogg` | `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5` |
| `city_silly` | `03_City_Silly_LOOP_EXTENDED.ogg` | `03_City_Silly.ogg` | `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d` |
| `final_round` | `04_Final_Round_LOOP.ogg` | `04_Final_Round.ogg` | `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83` |

Runtime destination:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

### Binary status — VERIFIED

Ron uploaded the four approved OGG binaries to the branch and normalized their runtime filenames by removing `_LOOP` / `_EXTENDED` from the filenames only.

The actual audio content remains the approved seamless-loop material.

Package validation requires all four OGG files in `dist/audio/bgm/` and computes SHA-256 for each. GitHub Actions passed this validation after the upload, confirming all four runtime files match the approved hashes.

A strict source importer remains available:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-bgm-pack.ps1 .\MeMeMe_Audio_Pack_0.1.16.2.zip
```

It verifies the original ZIP, verifies every source OGG, then copies to the normalized runtime filenames.

## BGM runtime integration completed

Files:
- `src/audio/bgmController.ts`
- `src/audio/bgmCatalog.ts`
- `src/main.ts`
- `src/scenes/LocalLobbyScene.ts`
- `src/scenes/SetupScene.ts`
- `src/scenes/PlaytestDemoBoardScene.ts`
- `src/styles.css`

Behavior:
- Lobby/Menu/Face Setup requests `menu_mememe`.
- Round 1 requests `city_bubble`.
- Round 2 requests `city_silly`.
- Round 3 requests `final_round`.
- Music transitions consume no gameplay RNG.
- Global BGM mute + volume control is always available.
- Mute/volume preference persists in localStorage.
- Browser autoplay restrictions are handled by retrying after the first real user gesture.
- Missing/unreadable binary asset shows `BGM ⚠` instead of failing the match.
- BGM selection never enters gameplay checksum state or command authority.

## Presentation Parity completed

### Diagnostics / bug report export

`PlaytestDemoBoardScene` has a `🐛 BUG REPORT` button.

The exported JSON contains build ID, timestamp, user agent, browser/session mode, shell status, deterministic match checksum, current BGM UI state, visible runtime logs and full serialized `MatchState`.

### Clear B$ / Card deltas

The playtest wrapper compares authoritative before/after player state and surfaces only real changes:
- B$ delta and resulting total;
- card gained + resulting hand size;
- card removed/played + remaining hand size.

Snapshot resync does not create fake delta spam.

### Remote movement presentation

Authoritative token destinations still come entirely from synced `MatchState`.

The playtest wrapper tweens from the previous screen position to the new authoritative destination instead of presenting an immediate snap. No predicted coordinate is written back into gameplay state.

### Card / News / Reaction authoritative event enrichment

`src/core/replay.ts` deterministically rebuilds presentation events while replaying the authoritative command stream.

Card/News events now carry the presentation data needed by both tabs:
- title / rarity / impact;
- description;
- authoritative resolution summary;
- amount when applicable;
- target player when applicable;
- deterministic spectator selection;
- `reactionEventId` when a reaction script exists.

Spectator selection reuses the same single RNG call that the previous reaction hook already consumed, so RNG call count / later gameplay randomness are unchanged. The chosen `spectatorId` is now recorded in the presentation event instead of being guessed independently on each client.

`eventLog` remains excluded from `computeMatchChecksum()` and does not alter command authority.

### Deterministic presentation model

New file:

`src/ui/presentationModel.ts`

It converts authoritative `MatchEvent` records into pure Card/News/Reaction presentation models. Reaction script selection uses the shared `reactions_mvp_demo.json` data and a stable seat-based voice variant while personality is not yet synchronized as presentation state.

This means host/client receive the same:
- actor;
- target;
- spectator;
- reaction sequence;
- reaction text variant;
- placeholder values such as `{amount}` / `{target}`.

### Cinematic Card / News / Reaction renderer

New file:

`src/ui/MatchPresentationLayer.ts`

New scene wrapper:

`src/scenes/PresentationParityBoardScene.ts`

`src/main.ts` now runs the presentation wrapper instead of registering `PlaytestDemoBoardScene` directly.

The wrapper leaves the stable deterministic/playtest board intact and only consumes newly applied authoritative events.

Visual treatment now includes:
- large centered Card / News panel instead of the old generic purple event toast;
- distinct Card, Card Blocked and News palettes;
- rarity badge (`N/R/SR/SSR`);
- impact stars;
- actor chip and target chip;
- card/news description plus authoritative result summary;
- animated entrance/exit;
- queued presentation so simultaneous events do not overwrite each other;
- Reaction speech bubbles following reaction sequence/delay/duration;
- speaker name + expression emoji;
- local face texture when available, with deterministic initial/avatar fallback when not;
- snapshot resync does not replay historical panels.

The old generic event toast hook is shadowed only in the new wrapper. Existing B$/Card delta toasts, logs, movement tween, BGM and bug-report behavior remain active.

### Presentation regression

New test:

`tests/presentation-events.ts`

New script:

`npm run test:presentation`

CI now verifies:
- News actor/spectator mapping;
- Card actor/target/spectator mapping;
- Reaction sequence order;
- stable seat-based reaction variant selection;
- reaction placeholder formatting;
- Card draw rarity model;
- non-Card/News events stay outside the cinematic presentation queue.

The first test run correctly caught an invalid test expectation for the P2 `whiny` reaction variant. The expectation was fixed without weakening runtime behavior. The subsequent full suite passed.

## External playtest 0.1.17

Guide:

`docs/PLAYTEST_0.1.17.md`

GitHub Actions artifact:

`mememe-playtest-0.1.17`

The package includes the four verified OGG files. `npm run test:package` fails if any is missing or its SHA-256 differs.

## Regression status

Current 0.1.17 regression suite is green and covers:
- TypeScript + Vite build;
- deterministic replay fixture;
- lockstep peer simulator;
- host/client queue + snapshot resync;
- ClientIntent → HostAuthority protocol;
- two-tab local browser session core;
- demo match shell/rematch;
- simple CPU autoplay stress;
- Card/News/Reaction presentation parity;
- external playtest package validation;
- exact packaged BGM checksums.

## Next Presentation Parity slices

1. Playtest/tune cinematic Card/News panel timing, spacing and reaction bubble readability against real gameplay capture.
2. Decide whether personality choices should become explicitly synchronized presentation metadata; do not put them into gameplay-critical checksum state by accident.
3. Evaluate local face sharing only with an explicit privacy contract and no silent upload/persistence.
4. Add dedicated visual/SFX hooks to reaction steps only after event parity remains stable.
5. Keep running 4-CPU autoplay and presentation regression after every lifecycle change.

## Important invariants

- Do not merge PR #1 unless Ron asks.
- Do not substitute or re-encode the approved BGM pack.
- Runtime filename normalization is allowed; approved content hashes remain authoritative.
- Do not let audio or presentation consume extra gameplay RNG.
- Do not put audio control state into gameplay-critical `MatchState`.
- Presentation `eventLog` may be serialized/synced, but stays excluded from gameplay checksum.
- Snapshot resync must not replay stale cinematic events.
- Do not weaken replay/checksum/authority tests to make presentation code pass.
- CPU remains a QA bot, not final gameplay AI.
