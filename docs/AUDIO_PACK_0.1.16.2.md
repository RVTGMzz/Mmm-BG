# MeMeMe BGM Pack 0.1.16.2

Status: **approved playtest audio ingredients, not yet wired into runtime playback**.

## Source bundle

Bundle name: `MeMeMe_Audio_Pack_0.1.16.2.zip`

SHA-256: `be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

The bundle contains four game-ready preview BGM files plus `bgm_manifest.json` and a README.

Important source-quality note: the supplied masters were MP3, so these OGG files are a lossy-to-lossy **playtest** conversion. If WAV masters become available, redo the release encode from WAV.

## Runtime format

- OGG Vorbis Quality 4
- 48 kHz
- Stereo
- Whole-file seamless-loop edits
- No custom loop-start metadata required

## Tracks

| ID | File | Role | Duration | SHA-256 |
|---|---|---|---:|---|
| `menu_mememe` | `01_Menu_MeMeMe_LOOP.ogg` | Menu / Lobby | 02:35.99 | `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e` |
| `city_bubble` | `02_City_Bubble_LOOP.ogg` | Main gameplay / light city flow | 02:06.38 | `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5` |
| `city_silly` | `03_City_Silly_LOOP_EXTENDED.ogg` | Gameplay / silly-chaos variation | 02:18.07 | `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d` |
| `final_round` | `04_Final_Round_LOOP.ogg` | Final round | 02:00.02 | `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83` |

Canonical metadata also lives in `assets/audio/bgm/bgm_manifest.json`.

## Edit notes

### 01 Menu
- source region about 00:02.432 → 02:41.152
- circular equal-power crossfade about 2.73s
- loop whole file

### 02 City Bubble
- source region about 00:00.341 → 02:09.451
- circular equal-power crossfade about 2.73s
- loop whole file

### 03 City Silly
- source loop unit about 00:02.005 → 01:13.429
- circular equal-power crossfade about 2.39s
- loop unit repeated twice so the playtest track exceeds two minutes
- loop whole final file

### 04 Final Round
- source region about 00:05.675 → 02:07.573
- circular equal-power crossfade about 1.88s
- loop whole file

## Intended next-build behavior

1. Lobby / menu: `menu_mememe` loops continuously.
2. Round 1–2: use `city_bubble` and `city_silly`, alternating/randomizing while avoiding an immediate repeat.
3. Round 3 / final round: transition to `final_round` and loop it.
4. Add a user-facing BGM volume/mute control before treating audio as release-ready.
5. Keep gameplay deterministic state independent from audio selection/presentation.

The exact presentation crossfade timing is not locked yet. The BGM state should be driven by shell/presentation state, not encoded into deterministic MatchState commands unless a later multiplayer requirement makes that necessary.

## Expected runtime path

When the binary files are committed/imported, place them at:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

Vite will then copy them into the production build under `audio/bgm/`.

## Binary handoff note

The GitHub connector available in the session that prepared this handoff can write UTF-8 repository content but cannot directly upload binary OGG/ZIP files. Therefore the repository contains the exact manifest, checksums, filenames, paths, and integration contract, while the binary bundle remains named `MeMeMe_Audio_Pack_0.1.16.2.zip` in the ChatGPT file context used to create this handoff.

At the start of the next work session, recover that exact bundle by filename/checksum before wiring playback. Do not regenerate or silently substitute tracks if the bundle is unavailable.
