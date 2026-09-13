# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current playable milestone: **MVP 0.1.16.2 — Simple CPU / Autoplay Test Bots**.

Read first:
1. `docs/MVP_0.1_HANDOFF.md`
2. `docs/AUDIO_PACK_0.1.16.2.md`
3. `assets/audio/bgm/bgm_manifest.json`
4. `src/audio/bgmCatalog.ts`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Newly approved BGM ingredients

Exact source bundle: `MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:
`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

Tracks:
- `01_Menu_MeMeMe_LOOP.ogg` — menu/lobby — 02:35.99
- `02_City_Bubble_LOOP.ogg` — gameplay — 02:06.38
- `03_City_Silly_LOOP_EXTENDED.ogg` — gameplay — 02:18.07
- `04_Final_Round_LOOP.ogg` — final round — 02:00.02

Format: OGG Vorbis Q4, 48 kHz stereo, whole-file seamless loops.

### Important binary note

The GitHub connector used in the session that created this handoff cannot directly upload binary OGG/ZIP bytes. The repo therefore already contains the **canonical filenames, SHA-256 hashes, metadata, expected paths and TypeScript catalog**, but not the four OGG binaries themselves.

At the start of the next chat, recover the exact bundle from ChatGPT File Library/current uploaded-file context by filename. Verify the bundle SHA-256 before integrating it. Do not regenerate/substitute audio silently.

Expected binary paths once imported:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

## Next build target

Proceed with **MVP 0.1.17 — Playtest Feedback + Presentation Parity + BGM Integration**.

Audio slice for 0.1.17:
- menu loops `menu_mememe`;
- round 1–2 alternate/randomize `city_bubble` / `city_silly` without immediate repeat;
- round 3 transitions to `final_round`;
- add BGM mute/volume control;
- audio stays presentation-only and must not disturb deterministic gameplay/replay/authority state.

Presentation priorities still remain:
- diagnostics/export bug report;
- clear B$/Card deltas after actions;
- remote movement presentation;
- Card/News/Reaction parity on client;
- local face sharing only if privacy contract remains explicit;
- use 4-CPU autoplay as regression harness.

## Current playtest launch path

Windows tester:
1. extract latest artifact;
2. double-click `START_PLAYTEST.bat`;
3. do not open `index.html` using `file:///`.

Recommended solo test: **1 human + 3 CPU**.
Stress path: **4 CPU AUTOPLAY**.
