# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Resume from here

Current development milestone: **MVP 0.1.20 — Board Readability & Turn Feel (ACTIVE / PLAYTEST PACKAGED)**.

Latest external playtest artifact: **`mememe-playtest-0.1.20`**.

Read first:
1. `docs/MVP_0.1.20_PROGRESS.md`
2. `docs/PLAYTEST_0.1.20.md`
3. `src/scenes/PresentationParityBoardScene.ts`
4. `src/ui/boardFeelPolicy.ts`
5. `tests/board-feel-020.ts`
6. `docs/MVP_0.1.19_PROGRESS.md`
7. `src/ui/MatchPresentationLayer.ts`
8. `src/ui/presentationFlowPolicy.ts`
9. `src/core/replay.ts`
10. `docs/AUDIO_PACK_0.1.16.2.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Why 0.1.20 exists

0.1.19 made the board-first flow usable. 0.1.20 focuses on making each turn easier to read and reducing visible QA/prototype residue before adding more content.

## New turn-readability behavior

### Active-turn halo
- current player token gets a soft yellow pulse ring;
- halo is a child of the token and moves with it;
- when turn changes, only the new current token pulses.

### Compact player status
The old score/debug block is hidden in the active wrapper.

New top-right status only shows:
- P# / player name;
- B$;
- card count;
- CPU marker where relevant;
- card-lock status;
- `▶` for current player.

Node IDs and checksum/debug detail are no longer part of the normal player-facing board HUD.

### Distance-aware movement
`src/ui/boardFeelPolicy.ts` defines `movementStepDurationMs()`.

Each `move_step` still uses authoritative path metadata, but visual travel time now scales with pixel distance:
- minimum 170ms;
- longer board edges receive more travel time;
- maximum 310ms;
- landing squash/bounce remains.

This is presentation-only and does not alter command timing, movement rules, RNG or checksum.

### Graphical pip dice
The active 0.1.20 wrapper overrides the prototype Unicode dice presentation.

The visible die now uses:
- rounded square body;
- physical pip layout for faces 1–6;
- short shake/rotation sequence;
- authoritative `dice_roll` result for the final face.

No random presentation roll is generated. The final face is always clamped/displayed from the authoritative result.

## Existing 0.1.19 behavior retained

- large permanent center HUD remains removed;
- main Card/News/Tile notices stay centered and temporary;
- reaction bubbles alternate left/right;
- dice only appears during roll;
- token movement visits each intermediate node;
- 1P+CPU / hotseat / global timing policy remains 3s/6s/10s as documented in 0.1.19;
- odd/even route selection remains automatic;
- result screen waits for final presentation;
- Card/News/Reaction do not replace gameplay BGM;
- BGM round transitions wait until presentation queue clears;
- face editor/compression remains intact.

## Regression

New command:

`npm run test:board-feel`

It locks:
- movement duration min/max and distance scaling;
- compact player status format without debug node/checksum data;
- current/CPU/card-lock markers;
- dice face clamp 1–6.

CI still runs all previous replay, lockstep, host/client, authority, two-tab, demo shell, CPU stress, presentation, flow, board-flow, image and package/BGM checks.

## Current artifact status

Validated run:

`34752504350` / run `#448`

Artifact:

`mememe-playtest-0.1.20`

Artifact digest:

`sha256:013caeb86a2be0b8d36c92e033a674f0cd44fb38c88d003139cbc2f273fa0a5e`

All CI steps passed, including **Board readability and turn feel** and artifact upload.

GitHub run URL:

`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34752504350`

## Recommended next work

First validate 0.1.20 visually:
1. halo follows the correct token and does not lag during movement;
2. compact status is readable without covering future map art;
3. pip dice feels better than the Unicode prototype and always shows the correct result;
4. distance-aware movement does not become sluggish on long edges;
5. Card/News/Reaction timing from 0.1.19 still feels natural.

If accepted, next milestone should move toward **content/gamefeel depth**, not more HUD churn:
- expand Card/News pool;
- improve reaction/personality variety;
- introduce stronger tile identity and small route feedback;
- replace synthesized SFX with approved assets when available;
- later evaluate explicit session-only face sharing under a privacy contract.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not put image/BGM/SFX preferences into gameplay-critical MatchState.
- Presentation eventLog remains excluded from gameplay checksum.
- Snapshot resync must not replay stale presentation events.
- Result/ranking must not cover unresolved final-turn presentation.
- Dice presentation must display the authoritative result, never invent another roll.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
