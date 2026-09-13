# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.19 — Board Flow & Movement (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.19`**.

Read first:
1. `docs/MVP_0.1.19_PROGRESS.md`
2. `docs/PLAYTEST_0.1.19.md`
3. `src/scenes/PresentationParityBoardScene.ts`
4. `src/ui/MatchPresentationLayer.ts`
5. `src/ui/presentationFlowPolicy.ts`
6. `src/ui/presentationModel.ts`
7. `tests/board-flow-019.ts`
8. `tests/flow-fix.ts`
9. `src/core/replay.ts`
10. `src/audio/bgmController.ts`
11. `src/audio/sfxController.ts`
12. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Why 0.1.19 exists

Real playtest feedback after 0.1.18.1 identified five playfeel problems:

1. permanent center HUD obscured the board and would fight future map art;
2. important notifications were visually disconnected from the center of attention;
3. reaction dialogue was stacked in the same region instead of reading like side conversation;
4. player tokens still appeared to jump directly to their final destination;
5. BGM changes near News/Card could be perceived as the event replacing the gameplay theme.

0.1.19 addresses these as presentation changes while keeping authoritative gameplay/replay/checksum architecture intact.

## Board-first HUD

The large inherited center control panel is removed in the active wrapper.

A compact bottom control strip now contains only:
- round/current player;
- Roll;
- Card.

The old always-visible phase/checksum/dice/log area is hidden from the middle of the board. QA score information remains for the current playtest.

## Dice → movement → resolution timeline

Roll replay now rebuilds deterministic presentation events:

1. `dice_roll`
2. one `move_step` for every traversed board edge
3. `ready_pass` when applicable
4. `tile_land`
5. Card/News event when applicable
6. Reaction sequence when applicable

The dice result still comes from the existing authoritative gameplay RNG. Presentation only animates that result and does not roll separately.

`move_step` includes `fromNodeId`, `toNodeId`, `step`, and `roll`.

The wrapper prevents moving actors from snapping to the final authoritative position and animates each step sequentially with a short tween plus squash/bounce.

## Notification timing policy

Presentation events now carry `affectedPlayerIds` metadata and timing decisions are centralized in `presentationFlowPolicy.ts`.

### 1 human + CPUs

- event affects the human → manual acknowledgement after text is readable;
- CPU-only event → auto-close <=6s;
- CPU-only skip is unavailable before 3s.

### Hotseat / host-client / multiple humans

Normal notices:
- auto-close <=6s;
- skip after >=3s and once text reveal permits.

### Global/all-player or long event

- auto-close <=10s;
- skip only after displayed text has fully revealed.

### 4 CPU AUTOPLAY

Dedicated QA stress mode remains fast auto-advance and does not wait 6 seconds per event.

## Presentation layout

Main Tile/Card/News/Ready notices are temporary **center-screen** panels.

Reaction/chat bubbles now alternate **left/right** around the board instead of piling below the main notification. They keep avatar/expression and reveal text progressively.

## Dice presentation

The old permanent dice readout is hidden.

A temporary animated die:
- appears only when a roll resolves;
- cycles faces;
- settles on the authoritative result;
- plays a lightweight dice SFX;
- disappears before step movement.

Current dice art is lightweight Unicode/prototype presentation, not final art.

## BGM behavior

Card/News/Reaction never select a BGM track directly.

0.1.19 additionally blocks round BGM synchronization while any presentation queue is active. This prevents a legitimate round transition from happening at the exact moment a News/Card panel appears and being misread as an event music change.

When the queue clears, round BGM may sync normally.

Entering the board restores Round 1 gameplay music after Lobby/Setup.

Approved runtime audio remains checksum-locked:

```text
public/audio/bgm/01_Menu_MeMeMe.ogg
public/audio/bgm/02_City_Bubble.ogg
public/audio/bgm/03_City_Silly.ogg
public/audio/bgm/04_Final_Round.ogg
```

Do not re-encode or substitute these files.

## Existing flow fixes retained

0.1.18.1 behavior remains:
- odd roll → odd branch / `PHỐ CHÍNH`;
- even roll → even branch / `HẺM TẮT`;
- no manual branch picker;
- result/ranking overlay waits for unresolved final presentation;
- snapshot resync does not replay stale presentation;
- gameplay/CPU remains gated by active presentation timeline.

## Regression

New command:

`npm run test:board-flow`

It locks:
- roll emits `dice_roll`;
- `dice_roll` precedes movement;
- roll emits sequential `move_step` metadata;
- 1P+3CPU event affecting P1 is manual;
- CPU-only notice skip >=3s and close <=6s;
- hotseat/host normal notice close <=6s;
- whole-board notice skip waits for text reveal and closes <=10s.

Full CI still runs replay, lockstep, host/client, authority, two-tab, demo-shell, CPU stress, presentation, previous flow regression, image regression and package/BGM checksum verification.

## Current artifact status

Latest validated artifact:

`mememe-playtest-0.1.19`

Validated code run: `34751573683`

Artifact digest:

`sha256:2bc85ce89829ff37d484cfbe41000f01c53a5486d863687bdeb479e42ae8a972`

Full CI passed all required steps including the new board-flow regression and artifact upload.

## Existing features retained

- Face Image Editor: drag/crop/zoom/pinch/rotate/reset/preview;
- 320×320 WebP runtime stickers when supported;
- Tile/Card/News/Ready presentation;
- floating B$, burst, confetti, card FX;
- synthesized SFX + FX mute;
- four approved BGM tracks with fade transition;
- 3-round QA match shell;
- deterministic CPU QA bots.

## Recommended next work

First priority is **real playtest validation of 0.1.19**:
1. confirm the board now feels visually open without the old giant center HUD;
2. confirm dice only appears during the roll;
3. confirm token movement visibly visits each intermediate tile;
4. confirm CPU notices and multiplayer notices feel right at 3s/6s;
5. confirm global/long notices remain readable but never exceed 10s;
6. confirm player-related events in 1P+3CPU wait for the human;
7. confirm reactions read naturally from left/right and do not obscure the central panel;
8. confirm News/Card never appear to replace the current BGM theme;
9. confirm final result still appears only after the final presentation clears.

After this feel is accepted:
- tune movement speed by visual map scale;
- replace prototype dice artwork with final dice treatment;
- reduce/remove remaining QA score UI for presentation builds;
- tune reaction bubble size/placement from captured footage;
- consider presentation-only personality sync;
- decide explicit privacy contract before any face sharing between clients;
- eventually replace synthesized SFX with approved audio assets.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute/re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put image/BGM/SFX preferences into gameplay-critical MatchState.
- Presentation eventLog may sync/serialize but remains excluded from gameplay checksum.
- Original face files must not be silently uploaded or persisted.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Dice animation must display the authoritative result, never invent another roll.
- CPU remains a QA bot, not final gameplay AI.
