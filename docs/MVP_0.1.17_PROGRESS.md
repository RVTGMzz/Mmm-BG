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

Package validation now requires all four OGG files in `dist/audio/bgm/` and computes SHA-256 for each. GitHub Actions passed this validation after the upload, confirming all four runtime files match the approved hashes.

A strict source importer still exists:

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

## Presentation Parity completed so far

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

### Card / News / Reaction parity foundation

`src/core/replay.ts` deterministically rebuilds presentation events while replaying the authoritative command stream:
- `money_tile`;
- `ready_pass`;
- `card_draw`;
- `card_draw_blocked`;
- `card_play`;
- `news` including `reactionEventId` when present.

`eventLog` remains excluded from `computeMatchChecksum()`.

`PlaytestDemoBoardScene` presents only newly arrived events on non-snapshot updates. Host and client can display Card draw, Card play, News and Reaction information from the same shared event stream.

This is parity plumbing + basic toast treatment, not final Card/News/Reaction art direction.

## External playtest 0.1.17

Guide:

`docs/PLAYTEST_0.1.17.md`

GitHub Actions artifact:

`mememe-playtest-0.1.17`

The package includes the four verified OGG files. `npm run test:package` fails if any is missing or its SHA-256 differs.

## Regression status

Current 0.1.17 regression suite covers:
- TypeScript + Vite build;
- deterministic replay fixture;
- lockstep peer simulator;
- host/client queue + snapshot resync;
- ClientIntent → HostAuthority protocol;
- two-tab local browser session core;
- demo match shell/rematch;
- simple CPU autoplay stress;
- external playtest package validation;
- exact packaged BGM checksums.

## Next Presentation Parity slices

1. Add polished Card / News / Reaction visual treatment on top of the shared deterministic presentation events.
2. Evaluate local face sharing only with an explicit privacy contract and no silent upload/persistence.
3. Add/extend presentation-specific regression checks if the visual lifecycle becomes more complex.
4. Re-run 4-CPU autoplay after each presentation lifecycle change.

## Important invariants

- Do not merge PR #1 unless Ron asks.
- Do not substitute or re-encode the approved BGM pack.
- Runtime filename normalization is allowed; approved content hashes remain authoritative.
- Do not let audio use or perturb gameplay RNG.
- Do not put audio control state into gameplay-critical `MatchState`.
- Presentation `eventLog` may be serialized/synced, but stays excluded from gameplay checksum.
- Do not weaken replay/checksum/authority tests to make presentation code pass.
- CPU remains a QA bot, not final gameplay AI.
