# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.17 — BGM Integration + Presentation Parity (IN PROGRESS)**.

Last fully packaged external playtest remains **MVP 0.1.16.2** until the exact approved OGG binaries are imported and verified.

Read first:
1. `docs/MVP_0.1.17_PROGRESS.md`
2. `docs/MVP_0.1_HANDOFF.md`
3. `docs/AUDIO_PACK_0.1.16.2.md`
4. `assets/audio/bgm/bgm_manifest.json`
5. `src/audio/bgmCatalog.ts`
6. `src/audio/bgmController.ts`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## BGM source-of-truth

Exact source bundle: `MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:
`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Tracks:
- `01_Menu_MeMeMe_LOOP.ogg` — menu/lobby — SHA-256 `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e`
- `02_City_Bubble_LOOP.ogg` — gameplay — SHA-256 `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5`
- `03_City_Silly_LOOP_EXTENDED.ogg` — gameplay — SHA-256 `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d`
- `04_Final_Round_LOOP.ogg` — final round — SHA-256 `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83`

Format: OGG Vorbis Q4, 48 kHz stereo, whole-file seamless loops.

### Binary status

The exact ZIP/OGG binaries are still not committed. The File Library available during the 0.1.17 session did not expose the original audio bundle, and the GitHub connector cannot upload binary OGG/ZIP bytes.

Do **not** silently regenerate or substitute audio.

Checksum-locked importer now exists:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-bgm-pack.ps1 .\MeMeMe_Audio_Pack_0.1.16.2.zip
```

Expected verified runtime paths:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

## MVP 0.1.17 progress already implemented

BGM runtime shell:
- Lobby / Setup → `menu_mememe`;
- Round 1 → `city_bubble`;
- Round 2 → `city_silly`;
- Round 3 → `final_round`;
- no immediate Round 1/2 repeat;
- no gameplay RNG consumed by BGM choice;
- global BGM mute + volume UI with local preference persistence;
- browser autoplay unlock handling;
- missing asset indicator `BGM ⚠` instead of gameplay failure.

Presentation Parity:
- `🐛 BUG REPORT` JSON export with checksum/session/log/state diagnostics;
- authoritative B$ deltas are logged + toasted;
- card gained/removed deltas are logged + toasted;
- snapshot resync is excluded from fake delta presentation.

Regression:
- full CI passed after the BGM controller fix, including deterministic replay and 4-CPU autoplay stress;
- check the newest CI after the B$/Card delta slice before continuing.

## Next build work

Continue **Presentation Parity** in this order:
1. verify latest CI;
2. remote movement tween/presentation;
3. Card / News / Reaction parity on client;
4. local face sharing only if privacy contract remains explicit;
5. run 4-CPU autoplay after each lifecycle/presentation change;
6. once the exact audio ZIP is accessible, run the checksum importer and then promote package verification/artifact naming to 0.1.17.

## Current playtest launch path

Windows tester:
1. extract latest artifact;
2. double-click `START_PLAYTEST.bat`;
3. do not open `index.html` using `file:///`.

Recommended solo test: **1 human + 3 CPU**.
Stress path: **4 CPU AUTOPLAY**.
