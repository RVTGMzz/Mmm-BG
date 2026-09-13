# MeMeMe MVP 0.1.17 — Progress Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Status: **IN PROGRESS**. Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.17 goal

Playtest Feedback + Presentation Parity + BGM Integration.

Audio and visual presentation must not alter gameplay-critical checksum state, command authority, seeded RNG behavior, or replay outcomes.

## BGM source-of-truth

Exact approved source bundle:

`MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:

`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Expected tracks:

| Runtime ID | File | SHA-256 |
|---|---|---|
| `menu_mememe` | `01_Menu_MeMeMe_LOOP.ogg` | `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e` |
| `city_bubble` | `02_City_Bubble_LOOP.ogg` | `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5` |
| `city_silly` | `03_City_Silly_LOOP_EXTENDED.ogg` | `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d` |
| `final_round` | `04_Final_Round_LOOP.ogg` | `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83` |

Expected runtime destination:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

### Binary status

The exact ZIP/OGG binaries are **still not committed**. The ChatGPT File Library search in the 0.1.17 work session did not expose the original ZIP or its four OGG children, and the GitHub connector cannot write binary bytes.

Do not regenerate, re-encode, rename, or silently substitute audio.

A strict importer exists:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-bgm-pack.ps1 .\MeMeMe_Audio_Pack_0.1.16.2.zip
```

It verifies the bundle SHA-256 first, then verifies every OGG SHA-256, and only then copies the exact files to `public/audio/bgm/`.

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
- Round 1/2 never immediately repeat and consume no gameplay RNG.
- Global BGM mute + volume control is always available.
- Mute/volume preference persists in localStorage.
- Browser autoplay restrictions are handled by retrying after the first real user gesture.
- Missing/unreadable binary asset shows `BGM ⚠` instead of failing the match.
- BGM selection never enters gameplay checksum state or command authority.

## Presentation Parity completed so far

### Diagnostics / bug report export

`PlaytestDemoBoardScene` has a `🐛 BUG REPORT` button.

The exported JSON contains:
- build ID;
- export timestamp;
- user agent;
- browser/session mode;
- shell status;
- deterministic match checksum;
- current BGM UI state;
- current visible runtime logs;
- full serialized `MatchState`.

### Clear B$ / Card deltas

The playtest presentation wrapper compares authoritative before/after player state and surfaces only real changes:
- B$ delta and resulting total;
- card gained + resulting hand size;
- card removed/played + remaining hand size.

Changes are written to the playtest log and briefly shown as toast notifications. Snapshot resync does not create fake delta spam.

### Remote movement presentation

Authoritative token destinations still come entirely from synced `MatchState`.

The playtest wrapper now intercepts the old snap-to-position visual update and tweens the token from its previous screen position to the new authoritative destination over a short presentation-only animation.

No movement coordinates are predicted or written back into gameplay state.

### Card / News / Reaction parity foundation

`src/core/replay.ts` now deterministically rebuilds presentation events while replaying the same authoritative command stream:
- `money_tile`;
- `ready_pass`;
- `card_draw`;
- `card_draw_blocked`;
- `card_play`;
- `news` including `reactionEventId` when present.

`eventLog` remains excluded from `computeMatchChecksum()`, so these presentation records do not alter gameplay checksum validation.

`PlaytestDemoBoardScene` consumes only newly arrived presentation events on non-snapshot state updates. Host and client can now display:
- Card draw title/impact;
- Card play title + authoritative resolution summary;
- News title + authoritative resolution summary;
- Reaction event ID when defined.

This is parity plumbing and basic toast presentation, not final polished Card/News/Reaction art direction yet.

## Regression status

The first BGM controller slice initially exposed one TypeScript omission (`emit()` missing). It was fixed immediately.

Every completed 0.1.17 slice after that has passed the full GitHub Actions regression suite, including the latest Card/News/Reaction parity UI slice:
- TypeScript + Vite build;
- deterministic replay fixture;
- lockstep peer simulator;
- host/client queue + snapshot resync;
- ClientIntent → HostAuthority protocol;
- two-tab local browser session core;
- demo match shell/rematch;
- simple CPU autoplay stress;
- external playtest package validation.

## Intentionally not promoted yet

The GitHub Actions artifact is still named `mememe-playtest-0.1.16.2` and still uses the 0.1.16 guide.

This is intentional until the exact approved OGG binaries are imported and verified. Do not call the current external artifact a complete 0.1.17 audio build while those binaries are absent.

## Next Presentation Parity slices

1. Add polished Card / News / Reaction visual treatment on top of the now-shared deterministic presentation events.
2. Evaluate local face sharing only with an explicit privacy contract and no silent upload/persistence.
3. Add/extend presentation-specific regression checks if the visual lifecycle becomes more complex.
4. Re-run 4-CPU autoplay after each presentation lifecycle change.
5. When the exact bundle becomes accessible, run `scripts/import-bgm-pack.ps1`, confirm all five checksums (bundle + four tracks), then make package verification require the four OGG files and promote artifact naming/guide to 0.1.17.

## Important invariants

- Do not merge PR #1 unless Ron asks.
- Do not substitute the approved BGM pack.
- Do not let audio use or perturb gameplay RNG.
- Do not put audio control state into gameplay-critical `MatchState`.
- Presentation `eventLog` may be serialized/synced, but stays excluded from gameplay checksum.
- Do not weaken replay/checksum/authority tests to make presentation code pass.
- CPU remains a QA bot, not final gameplay AI.
