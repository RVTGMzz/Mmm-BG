# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Current milestone

**MVP 0.1.30 — Direct Turn Dice (ACTIVE / PLAYTEST PACKAGED)**

Latest artifact: `mememe-playtest-0.1.30`

Read first:
1. `docs/MVP_0.1.30_PROGRESS.md`
2. `docs/PLAYTEST_0.1.30.md`
3. `src/scenes/DirectDiceBoardScene.ts`
4. `src/ui/directDicePolicy.ts`
5. `tests/direct-dice-030.ts`
6. `docs/MVP_0.1.29_PROGRESS.md`
7. `src/core/functionTiles.ts`
8. `src/content/core/function_tiles_mvp.json`
9. `src/content/city/board_city_mvp.json`
10. `src/core/replay.ts`
11. `src/ui/presentationModel.ts`
12. `src/scenes/TacticalChoiceBoardScene.ts`
13. `src/core/testBot.ts`
14. `src/core/authority.ts`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.30 summary

The old bottom red `ĐỔ XÚC XẮC` control is hidden and disabled.

When a locally controlled human reaches `PRE_ROLL_ACTION`:
- a large clickable die appears directly on the board;
- the player may still use a Card first;
- clicking the die calls the existing authoritative Roll path;
- the idle die immediately disappears;
- the existing graphical roll animation displays the actual authoritative result;
- token movement continues node-by-node as before.

The idle die uses a fixed visual pip face and consumes no gameplay RNG.

A per-turn pending guard prevents double-submit if UI updates before host state changes.

CPU seats do not receive a clickable die. Remote/non-controlling clients also do not receive it. It is hidden during ROLLING, MOVING, presentation blocks, waiting shell and match end.

New regression:

`npm run test:direct-dice`

It locks direct-dice visibility for human/CPU/network/phase conditions.

## 0.1.29 function tile foundation retained

Board nodes still include:
- node 9 → `MINIGAME_SLOT_01`
- node 12 → `JOB_SLOT_01`

The board visibly shows 🎮 Mini Game and 💼 Job foundation spaces. They emit deterministic presentation events, consume no extra RNG, apply no rewards/penalties yet, and never deadlock CPU/replay.

## Other retained systems

- starting wallet 200 B$
- READY +100 B$
- Tactical Choice / Kèo Hai Cửa
- rare deterministic CPU Card quirk
- CPU/NPC chat duration 2.5×
- live B$ leaderboard and money deltas
- node-by-node movement and automatic parity routing
- Settings, BGM/SFX and face editor/privacy behavior

## Validated artifact

GitHub Actions run: `34767733314` / run `#776`

Head SHA: `7654a8b48ebba67ab681f5f5f802cc4a562f5e28`

Artifact: `mememe-playtest-0.1.30`

Digest: `sha256:a42203e5067517e022ea69430f62a7d57377cc59795a383d3ab4aadb76b8582b`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34767733314`

Full CI passed through artifact upload, including Direct Dice, Mini Game + Job foundation, replay, authority, two-tab, CPU autoplay and all earlier regressions.

## Next work — 0.1.31

Turn the Mini Game and Job foundation into playable gameplay after the exact rules are explicitly locked.

Known long-term board direction from earlier project design:
- board target is larger than the current MVP graph;
- Job is a supported system;
- function spaces are intended to reshuffle when the Leader completes a lap.

Do not invent missing Mini Game or Job reward/input rules from those high-level notes alone.

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not invent final Mini Game/Job rules without explicit confirmation.
- Presentation eventLog remains checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Result/ranking must wait for final presentation to clear.
- Dice presentation must show the authoritative result.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
