# MeMeMe MVP 0.1.17 — Progress Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Status: **IN PROGRESS**. Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.17 goal

Playtest Feedback + Presentation Parity + BGM Integration.

This milestone must keep audio/presentation outside deterministic `MatchState`, seeded RNG, replay and host-authority state.

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

A strict importer now exists:

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
- Round 1/2 therefore never immediately repeat and do not consume gameplay RNG.
- Global BGM mute + volume control is always available.
- Mute/volume preference persists in localStorage.
- Browser autoplay restrictions are handled by retrying after first real user gesture.
- Missing/unreadable binary asset shows `BGM ⚠` instead of failing the match.
- BGM selection is presentation-only and never enters deterministic match commands/state.

## Presentation Parity progress completed

### Diagnostics / export bug report

`PlaytestDemoBoardScene` now has a `🐛 BUG REPORT` button.

It exports JSON containing:
- build ID;
- export timestamp;
- user agent;
- browser/session mode;
- shell status;
- deterministic match checksum;
- current BGM UI state;
- current visible runtime logs;
- full serialized `MatchState`.

This is intended for tester reports without changing gameplay authority.

### Clear B$ / Card deltas

The playtest presentation wrapper now compares authoritative before/after player state and surfaces only real changes:
- B$ delta and resulting total;
- card gained + resulting hand size;
- card removed/played + remaining hand size.

Changes are written to the playtest log and briefly shown as a toast. Snapshot resync does not produce fake delta spam.

The delta hook is presentation-only and wraps authoritative state application; it does not modify state.

## Regression status

After the first BGM controller commit, CI caught a missing local `emit()` helper in the new controller. That was fixed immediately.

A subsequent full CI run passed:
- TypeScript + Vite build;
- deterministic replay fixture;
- lockstep peer simulator;
- host/client queue + snapshot resync;
- ClientIntent → HostAuthority protocol;
- two-tab local browser session core;
- demo match shell/rematch;
- simple CPU autoplay stress;
- external playtest package validation.

A new CI run is also triggered by the B$/Card delta slice and should be checked before the next code slice.

## Intentionally not promoted yet

The GitHub Actions artifact is still named `mememe-playtest-0.1.16.2` and still uses the 0.1.16 guide. This is intentional until the exact approved OGG binaries are imported and verified.

Do not call the external artifact a complete 0.1.17 audio build while the approved binaries are absent.

## Next Presentation Parity slices

1. Check the latest CI after the B$/Card delta hook.
2. Add remote token movement tween/presentation while keeping authoritative destination state unchanged.
3. Improve Card / News / Reaction presentation parity on client.
4. Evaluate local face sharing only with an explicit privacy contract and no silent upload/persistence.
5. Re-run 4-CPU autoplay regression after each presentation lifecycle change.
6. When the exact bundle becomes accessible, run `scripts/import-bgm-pack.ps1`, confirm all five checksums (bundle + four tracks), then allow CI/package verification to require the four OGG files.

## Important invariants

- Do not merge PR #1 unless Ron asks.
- Do not substitute the approved BGM pack.
- Do not let audio use or perturb gameplay RNG.
- Do not put audio state into deterministic `MatchState` for this MVP.
- Do not weaken replay/checksum/authority tests to make presentation code pass.
- CPU remains a QA bot, not final gameplay AI.
