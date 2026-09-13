# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.17 — BGM Integration + Presentation Parity (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.17`**.

Read first:
1. `docs/MVP_0.1.17_PROGRESS.md`
2. `docs/MVP_0.1_HANDOFF.md`
3. `docs/AUDIO_PACK_0.1.16.2.md`
4. `assets/audio/bgm/bgm_manifest.json`
5. `src/audio/bgmCatalog.ts`
6. `src/audio/bgmController.ts`
7. `docs/PLAYTEST_0.1.17.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## BGM source-of-truth

Exact source bundle: `MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:
`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Original source filenames / approved hashes:
- `01_Menu_MeMeMe_LOOP.ogg` — SHA-256 `df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e`
- `02_City_Bubble_LOOP.ogg` — SHA-256 `c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5`
- `03_City_Silly_LOOP_EXTENDED.ogg` — SHA-256 `53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d`
- `04_Final_Round_LOOP.ogg` — SHA-256 `3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83`

Format: OGG Vorbis Q4, 48 kHz stereo, whole-file seamless loops.

### Runtime binary status — VERIFIED

Ron manually uploaded the four approved OGG binaries to GitHub and normalized the runtime names by removing the descriptive `_LOOP` / `_EXTENDED` suffixes.

Runtime paths:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

The audio content itself remains unchanged and still loops seamlessly at runtime.

`npm run test:package` now requires all four OGGs in `dist/audio/bgm/` and computes SHA-256 for each. GitHub Actions passed package validation after the upload, proving the runtime files match all four approved hashes.

Checksum-locked source importer remains available:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-bgm-pack.ps1 .\MeMeMe_Audio_Pack_0.1.16.2.zip
```

It verifies the original source ZIP + OGG hashes, then copies them to the normalized runtime filenames above.

## MVP 0.1.17 implemented

BGM:
- Lobby / Setup → `menu_mememe`;
- Round 1 → `city_bubble`;
- Round 2 → `city_silly`;
- Round 3 / Final Round → `final_round`;
- no gameplay RNG consumed by BGM choice;
- global BGM mute + volume UI with local preference persistence;
- browser autoplay unlock handling;
- missing asset indicator `BGM ⚠` instead of gameplay failure;
- four approved OGGs now packaged and checksum-locked by CI.

Presentation Parity:
- `🐛 BUG REPORT` JSON export with checksum/session/log/state diagnostics;
- authoritative B$ deltas logged + toasted;
- card gained/removed deltas logged + toasted;
- remote token destination remains authoritative, with presentation-only movement tween instead of snap;
- deterministic presentation `eventLog` is rebuilt during replay and remains excluded from gameplay checksum;
- host/client receive the same Card draw, Card play, News and `reactionEventId` presentation events;
- basic Card/News/Reaction toast UI is wired on both host and client;
- snapshot resync is excluded from fake delta/event presentation.

Regression:
- build, deterministic replay, lockstep, host/client snapshot resync, authority protocol, two-tab session, demo shell, CPU autoplay stress and package validation remain green;
- package validation now includes exact BGM SHA-256 verification.

## External playtest

Guide: `docs/PLAYTEST_0.1.17.md`

CI artifact: `mememe-playtest-0.1.17`

Windows tester:
1. extract artifact;
2. double-click `START_PLAYTEST.bat`;
3. do not open `index.html` using `file:///`.

Recommended solo test: **1 human + 3 CPU**.
Stress path: **4 CPU AUTOPLAY**.

## Next build work

Continue **Presentation Parity** in this order:
1. polish Card / News / Reaction visual treatment using the shared presentation events already in place;
2. evaluate local face sharing only if the privacy contract remains explicit and no image is silently uploaded/persisted;
3. add presentation-specific regression coverage if lifecycle complexity grows;
4. keep running 4-CPU autoplay after presentation changes;
5. do not change deterministic gameplay checksum/RNG/authority semantics for presentation work.
