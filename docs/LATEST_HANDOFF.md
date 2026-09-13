# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.18 — Tile Resolution + Image Editor + FX (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.18`**.

Read first:
1. `docs/MVP_0.1.18_PROGRESS.md`
2. `docs/PLAYTEST_0.1.18.md`
3. `docs/MVP_0.1.17_PROGRESS.md`
4. `docs/AUDIO_PACK_0.1.16.2.md`
5. `src/ui/FaceImageEditor.ts`
6. `src/systems/faces.ts`
7. `src/ui/presentationModel.ts`
8. `src/ui/MatchPresentationLayer.ts`
9. `src/audio/sfxController.ts`
10. `src/audio/bgmController.ts`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## BGM source-of-truth

Approved runtime audio remains:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

All four files remain checksum-locked by package validation.

0.1.18 adds short fade-out/fade-in transitions between tracks without touching gameplay RNG or MatchState.

## MVP 0.1.18 implemented

### Image Editor + runtime optimization

Face Setup now supports:
- drag/reposition;
- zoom 100–300%;
- wheel zoom;
- pinch zoom;
- smooth rotation -180°..+180°;
- quick ±90°;
- reset;
- live preview;
- confirm/cancel.

Confirmed images are rendered to a **320×320 runtime sticker** and exported as WebP quality ~0.84 when supported, with browser fallback behavior. Original selected files are not stored in gameplay state or silently uploaded.

### Tile Resolution Presentation

Every resolved landing now emits authoritative presentation event `tile_land` before tile-specific resolution.

Feedback:
- normal tile → compact landing banner;
- money tile → banner + floating +/- B$;
- card tile → landing banner then Card cinematic;
- news tile → landing banner then News cinematic;
- READY pass → +100 B$ banner + burst/confetti.

`tile_land` is excluded from gameplay checksum and does not consume RNG.

### Visual FX

Added presentation-only:
- deterministic radial burst;
- floating money;
- small card flip;
- stronger SSR burst + tiny camera shake;
- READY confetti;
- existing reaction bubbles preserved.

No gameplay RNG is used for FX.

### SFX

New synthesized WebAudio placeholder cues:
- coin gain/loss;
- card draw/play;
- news;
- reaction;
- READY;
- landing;
- UI confirm.

Audio HUD now includes independent `FX 🔔 / FX 🔕` local preference.

### Regression

CI now includes:
- `npm run test:presentation` for Tile/Card/News/Reaction presentation models;
- `npm run test:image` for face transform bounds/runtime target;
- all existing replay/lockstep/authority/two-tab/demo-shell/CPU/package/BGM checks.

Latest full run passed all steps and uploaded:

`mememe-playtest-0.1.18`

Artifact digest:

`sha256:bcb5dff142595053678f19b2fbc3a6c983873238a89fdf91aa426b3096c5fe6f`

## Recommended next build work

1. Real-device tune landing banner timing, floating money position, burst/confetti density and SFX levels.
2. Test image editor on Android touch specifically: drag, pinch, rotate, confirm/cancel.
3. Decide explicit face-sharing/privacy contract before syncing runtime face stickers to client tabs.
4. Sync personality as presentation-only metadata before using custom personality to select reaction variants.
5. Replace synth SFX with approved OGG/WAV assets only after timing/playfeel is accepted.
6. Clean the older internal build label inside the stable bug-report wrapper when that base scene is next modified.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put image/BGM/SFX preferences into gameplay-critical MatchState.
- Presentation eventLog may sync/serialize but remains excluded from gameplay checksum.
- Original face files must not be silently uploaded or persisted.
- Snapshot resync must not replay stale presentation events.
- CPU remains a QA bot, not final gameplay AI.
