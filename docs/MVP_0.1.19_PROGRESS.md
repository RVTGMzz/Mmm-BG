# MeMeMe MVP 0.1.19 — Board Flow & Movement

## Status

**ACTIVE / PLAYTEST PACKAGED**

Validated artifact: `mememe-playtest-0.1.19`

Validated run: `34751573683`

Artifact digest:

`sha256:2bc85ce89829ff37d484cfbe41000f01c53a5486d863687bdeb479e42ae8a972`

## Why this milestone exists

0.1.18.1 fixed stale presentation backlog, but real playtest showed the board was still visually dominated by a permanent center HUD and movement still felt like state snapping rather than a board game turn.

0.1.19 makes the board the primary visual surface and turns each roll into a presentation timeline:

`dice → step-by-step movement → landing → tile/Card/News → reactions → next turn`

## Board-first HUD

The inherited large 430×300 center control panel is removed from the active presentation wrapper.

The board now keeps only a compact bottom control bar with:
- current round/player;
- Roll button;
- Card button.

The permanent phase/checksum/dice/log block no longer occupies the middle of the map. QA score information remains available outside the main play area.

## Temporary dice animation

A deterministic `dice_roll` presentation event is rebuilt from the authoritative command stream.

The dice:
- appears only during a roll;
- animates through several faces;
- settles on the already-authoritative D6 result;
- plays a lightweight dice SFX;
- disappears before movement starts.

The animation never rolls its own gameplay random value.

## Step-by-step movement

Replay now emits one `move_step` presentation event for every traversed edge.

Each step records:
- actor/player;
- from node;
- destination node;
- current step number;
- original roll value.

`PresentationParityBoardScene` prevents the moving token from snapping to the final authoritative destination and instead consumes each `move_step` in sequence.

Visual movement per step:
- short tween to the next board node;
- tiny squash/bounce on arrival;
- next step begins only after the previous one finishes.

Non-moving players still snap to authoritative coordinates during sync/resync.

## Audience-aware notification timing

Presentation events now carry `affectedPlayerIds` as presentation metadata.

Timing policy is centralized in `src/ui/presentationFlowPolicy.ts`.

### Solo: one human + CPUs

If an event affects the single human player:
- presentation is manual;
- it waits for explicit acknowledgement after text is readable.

If the event is CPU-only:
- it closes automatically;
- skip is enabled no sooner than 3 seconds;
- auto-close is capped at 6 seconds.

### Hotseat / human-vs-human / host-client

Normal notices do not block the board forever:
- automatic close within 6 seconds;
- skip only after at least 3 seconds and after the text has revealed far enough.

### Global / whole-board events

If all players are affected:
- event is bounded to 10 seconds maximum;
- skip becomes available only after the displayed text has finished revealing.

### Four-CPU stress mode

Dedicated 4-CPU autoplay remains aggressively accelerated so QA stress tests do not wait several seconds for every presentation event.

## Notification layout

Main gameplay notifications are centered temporarily:
- landing;
- Card draw/play;
- News;
- Ready bonus.

Reaction/chat is no longer stacked underneath the main panel. Reaction bubbles now alternate between the left and right sides of the screen, with avatar/expression and type-on text.

## BGM behavior

Card/News/Reaction do not choose or replace BGM tracks.

0.1.19 also prevents round-theme synchronization from happening while the presentation queue is active. Therefore an event cannot visually coincide with a BGM switch and appear to have changed the music itself.

If a real round transition has occurred, the round theme is synchronized only after the current presentation queue has cleared.

Entering the board explicitly restores Round 1 gameplay music after menu/setup.

Approved BGM files remain unchanged and checksum-locked.

## New presentation events

`dice_roll`
- result
- affectedPlayerIds

`move_step`
- fromNodeId
- toNodeId
- step
- roll
- affectedPlayerIds

Existing Tile/Card/News/Ready events now include presentation-only `affectedPlayerIds` metadata where possible.

## Regression

New command:

`npm run test:board-flow`

It checks:
- authoritative roll emits `dice_roll`;
- `dice_roll` precedes `move_step` events;
- movement emits destination node metadata;
- one-human event is manual in 1P+3CPU;
- CPU-only event is skippable only after >=3s and closes <=6s;
- hotseat/host normal notices close <=6s;
- global events cannot skip before text reveal and close <=10s.

Full CI also retains:
- deterministic replay;
- lockstep;
- host/client resync;
- authority protocol;
- two-tab core;
- demo shell/rematch;
- CPU stress;
- presentation model regression;
- 0.1.18.1 flow/parity/result deferral regression;
- image transform tests;
- external package and BGM checksum verification.

## CI result

Run `34751573683` passed every required step and uploaded:

`mememe-playtest-0.1.19`

Digest:

`sha256:2bc85ce89829ff37d484cfbe41000f01c53a5486d863687bdeb479e42ae8a972`

## Real playtest priorities

1. Verify the compact bottom HUD leaves enough room for the board and future map art.
2. Verify dice appears only while rolling and feels readable, not intrusive.
3. Verify a roll of 4 visually visits four successive nodes instead of jumping directly to the destination.
4. Verify reaction bubbles alternate left/right and do not obscure the central notification.
5. In 1P+3CPU, verify CPU-only notices auto-close and player-related notices wait for the human.
6. Verify 3s/6s/10s timing feels natural on actual hardware.
7. Verify News/Card never appears to replace the gameplay theme.
8. Verify final ranking still waits until the last presentation has cleared.

## Known limitations / next polish

- Actual visual spacing of side reaction bubbles still needs real-device/video feedback.
- Step duration is currently a fixed short presentation value and may need tuning by map scale.
- Dice animation currently uses lightweight Unicode dice artwork; final dice art/3D treatment is still open.
- Debug score panel remains visible for QA and is not final HUD design.
- Synthesized SFX are still placeholders.
- Face sharing across client tabs is still intentionally not implemented without a privacy contract.
- Personality is not yet synced as presentation metadata.

## Invariants

- Do not merge PR #1 or mark Ready without Ron's explicit instruction.
- Do not re-encode/substitute approved BGM.
- Do not consume additional gameplay RNG for presentation.
- Presentation eventLog remains checksum-excluded.
- Snapshot resync must not replay stale presentation events.
- Original face files must not be silently uploaded or persisted.
- Result overlay must not cover unresolved final presentation.
- CPU remains a QA bot, not final AI.
