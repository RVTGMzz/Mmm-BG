# MeMeMe MVP 0.1.18 — Tile Resolution + Image Editor + FX

Branch: `mememe-mvp-0.1-core`
PR: #1

Status: **ACTIVE / EXTERNAL PLAYTEST PACKAGED**. Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Goal

Make the core play loop read clearly as:

`roll → move → land → understand tile result → continue cinematic/result`

At the same time, make face photos lightweight before gameplay and add a first presentation FX/SFX pass without touching deterministic gameplay state.

## Image Editor implemented

Files:
- `src/ui/FaceImageEditor.ts`
- `src/systems/faces.ts`
- `src/scenes/SetupScene.ts`
- `src/styles.css`

Behavior:
- drag/reposition image;
- zoom slider 100–300%;
- mouse wheel zoom;
- two-pointer pinch zoom;
- smooth rotation -180°..+180°;
- quick ±90° rotate;
- reset;
- live circular sticker preview;
- confirm/cancel;
- runtime sticker target is 320×320;
- export prefers WebP quality 0.84, browser fallback may produce PNG;
- original selected file is not stored in gameplay state;
- only the processed Data URL is kept in the current in-memory `gameSession`.

Regression:
- `npm run test:image` locks transform clamping and 320px runtime target.

## Tile Resolution Presentation implemented

`src/core/replay.ts` now emits a presentation-only `tile_land` event for every resolved landing, before the tile-specific event/effect.

Data:
- `nodeId`;
- `tileType`;
- `value` where relevant;
- actorId from the authoritative current player.

`tile_land` remains in presentation eventLog only and is excluded from gameplay checksum.

No extra gameplay RNG calls were introduced.

Presentation behavior in `src/ui/presentationModel.ts` + `src/ui/MatchPresentationLayer.ts`:
- normal tile → compact landing banner;
- money tile → compact banner + floating +/- B$;
- card tile → landing banner then Card Draw cinematic already queued by eventLog;
- news tile → landing banner then News cinematic;
- READY pass → +100 B$ bonus banner + burst/confetti.

## Visual FX implemented

Presentation-only deterministic visual effects:
- radial burst using fixed index angles, no gameplay RNG;
- floating money text;
- small card flip on Card draw/play;
- stronger burst + very small camera shake for SSR;
- READY confetti;
- existing reaction bubbles retained.

## SFX implemented

New `src/audio/sfxController.ts`.

Current cues are lightweight synthesized WebAudio placeholders:
- `coin_gain`;
- `coin_loss`;
- `card_draw`;
- `card_play`;
- `news`;
- `reaction`;
- `ready`;
- `land`;
- `ui_confirm`.

The audio HUD now has independent `FX 🔔 / FX 🔕` control with localStorage preference.

These cues are intentionally asset-free for timing/playfeel validation. They can later be swapped for approved OGG/WAV without changing presentation event logic.

## BGM polish implemented

`src/audio/bgmController.ts` keeps the same approved/checksum-locked four OGG tracks but now performs:
- short fade-out on old track;
- track swap;
- short fade-in on new track.

This remains presentation-only and does not touch MatchState/RNG.

## Playtest packaging

Guide:
- `docs/PLAYTEST_0.1.18.md`

CI artifact:
- `mememe-playtest-0.1.18`

Verified artifact from successful full CI:
- artifact id: `10313458861`
- size: `8,491,975` bytes
- digest: `sha256:bcb5dff142595053678f19b2fbc3a6c983873238a89fdf91aa426b3096c5fe6f`

## Regression status

Full GitHub Actions run PASS after the editor syntax fix:
- TypeScript + Vite build;
- deterministic replay fixture;
- lockstep peer simulator;
- host/client queue + snapshot resync;
- ClientIntent → HostAuthority protocol;
- two-tab local browser session core;
- demo match shell/rematch;
- simple CPU autoplay stress;
- Tile/Card/News/Reaction presentation parity;
- face image transform bounds;
- external package validation;
- approved BGM checksum validation;
- playtest guide packaging;
- artifact upload.

## Known limitations / next work

1. Real-device visual tuning is still needed for landing banner duration, floating money position and FX intensity.
2. Face images remain local to the host/tab and are not synced to another client tab yet.
3. Custom personality choices are not yet presentation-authoritative metadata.
4. Synth SFX are placeholders; approved sound assets can replace them later.
5. Bug-report payload in the stable base wrapper still carries the older internal build label and should be cleaned when the base wrapper is next touched.
6. Keep presentation eventLog excluded from gameplay checksum.
7. Do not add presentation RNG calls that perturb gameplay RNG.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not re-encode/substitute the approved BGM files.
- Do not upload/persist original face images silently.
- Do not place image/SFX/BGM settings into gameplay-critical MatchState.
- Snapshot resync must not replay stale presentation events.
- CPU remains a QA bot, not final gameplay AI.
