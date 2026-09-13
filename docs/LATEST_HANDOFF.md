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
7. `src/ui/presentationModel.ts`
8. `src/ui/MatchPresentationLayer.ts`
9. `src/scenes/PresentationParityBoardScene.ts`
10. `docs/PLAYTEST_0.1.17.md`

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

Runtime paths:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

Ron manually uploaded the four approved OGG binaries and normalized runtime filenames only. Audio content remains unchanged.

`npm run test:package` requires all four OGGs in `dist/audio/bgm/` and verifies exact SHA-256 values.

Checksum-locked source importer:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-bgm-pack.ps1 .\MeMeMe_Audio_Pack_0.1.16.2.zip
```

## MVP 0.1.17 implemented

### BGM

- Lobby / Setup → `menu_mememe`;
- Round 1 → `city_bubble`;
- Round 2 → `city_silly`;
- Round 3 / Final Round → `final_round`;
- no gameplay RNG consumed by BGM choice;
- global BGM mute + volume UI with local preference persistence;
- browser autoplay unlock handling;
- missing asset indicator `BGM ⚠` instead of gameplay failure;
- four approved OGGs packaged and checksum-locked by CI.

### Presentation Parity

Stable playtest shell features:
- `🐛 BUG REPORT` JSON export with checksum/session/log/state diagnostics;
- authoritative B$ deltas logged + toasted;
- card gained/removed deltas logged + toasted;
- remote token destination remains authoritative, with presentation-only movement tween instead of snap;
- snapshot resync excluded from fake delta/event presentation.

Card / News / Reaction now goes beyond the previous generic toast layer:
- authoritative eventLog includes title, rarity, impact, description, summary and amount when relevant;
- card play events include deterministic target/spectator metadata and reaction hook when supported;
- news events include deterministic spectator metadata and existing `reactionEventId`;
- spectator selection records the result of the same RNG call already consumed previously, so RNG count/later gameplay remain unchanged;
- presentation `eventLog` is rebuilt during replay and remains excluded from gameplay checksum;
- `src/ui/presentationModel.ts` builds pure deterministic Card/News/Reaction models;
- reaction text variant is currently stable seat-based so host/client choose the same variant while personality sync is not yet presentation-authoritative;
- `src/ui/MatchPresentationLayer.ts` renders large animated Card/News panels, rarity badge, impact, actor/target chips, description, authoritative summary and queued reaction speech bubbles;
- reaction bubbles include speaker, expression emoji and local face texture when available, with deterministic initial fallback;
- `src/scenes/PresentationParityBoardScene.ts` layers this renderer over the stable playtest board without changing gameplay authority/core;
- the old generic purple event toast is shadowed by the new wrapper, while B$/Card delta toasts and logs remain active.

### Presentation regression

New CI script:

`npm run test:presentation`

Coverage:
- News actor/spectator parity;
- Card actor/target/spectator parity;
- Reaction sequence ordering;
- deterministic reaction variant selection;
- placeholder interpolation;
- Card draw rarity model;
- filtering non-Card/News events from cinematic queue.

The latest full regression passed including this test, CPU autoplay and package upload.

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
1. tune Card/News cinematic timing, spacing and reaction readability from real playtest capture;
2. decide whether custom personality choices become explicitly synced presentation metadata, without entering gameplay-critical checksum state;
3. evaluate local face sharing only if the privacy contract remains explicit and no image is silently uploaded/persisted;
4. add reaction SFX hooks only after event parity stays stable;
5. keep running `test:presentation` + 4-CPU autoplay + full CI after lifecycle changes.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not add extra presentation RNG calls.
- Do not put BGM or presentation preferences into gameplay-critical checksum state.
- Presentation eventLog may sync/serialize but remains excluded from gameplay checksum.
- Snapshot resync must never replay stale cinematic events.
- Do not weaken replay/checksum/authority tests for UI work.
- CPU remains a QA bot, not final gameplay AI.
