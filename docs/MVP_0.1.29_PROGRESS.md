# MeMeMe MVP 0.1.29 — Mini Game + Job Tile Foundation

Status: IMPLEMENTED / FINAL CI PENDING

## Goal

Introduce Mini Game and Job as real board function-space families without inventing final rules before they are explicitly locked.

## Board schema

`BoardNode` now supports:
- `feature: minigame | job`
- `contentId`

The physical graph and base TileType model remain intact so this milestone does not require a MatchState schema migration.

Current placements:
- node 9 → `MINIGAME_SLOT_01`
- node 12 → `JOB_SLOT_01`

Both content hooks are declared in `src/content/core/function_tiles_mvp.json` with `status = foundation`.

## Deterministic resolver

`src/core/functionTiles.ts` owns the 0.1.29 function-space foundation resolution.

Landing on a function tile:
1. emits the normal `tile_land` event with feature metadata;
2. resolves the feature through the deterministic foundation resolver;
3. emits `minigame_tile` or `job_tile`;
4. performs no reward, penalty, extra RNG or player-authored choice yet;
5. returns to normal turn flow.

This provides a stable insertion point for 0.1.30 without adding a temporary command or phase that would later need removal.

## Presentation

The active board overlays:
- 🎮 cyan Mini Game marker;
- 💼 orange Job marker.

Function events use the existing compact landing presentation path and explain that the feature is foundation-only.

The generic `tile_land` panel is suppressed for these nodes so players do not see two landing cards for the same function space.

## CPU / authority safety

Function tiles currently auto-resolve at gameplay-core level. Therefore:
- QA CPU does not need a new decision type;
- autoplay cannot wait on an unimplemented Mini Game or Job choice;
- host authority continues accepting the standard authoritative roll;
- snapshot/replay behavior stays inside the existing command stream.

## Regression

`npm run test:function-tiles`

Locks:
- exactly one Mini Game and one Job foundation node on the current MVP board;
- board content IDs resolve to the function catalog;
- catalog entries remain marked foundation;
- resolver mutates no gameplay state and consumes no RNG;
- Mini Game and Job events produce visible presentation models;
- replay emits function events and returns to `PRE_ROLL_ACTION`;
- host authority accepts a roll through a function tile without deadlock;
- function resolution adds zero RNG calls beyond the authoritative dice roll.

## Retained from 0.1.28

- rare deterministic CPU Card quirk;
- 2.5× CPU/NPC side-chat dwell;
- Tactical Choice;
- 200 B$ economy;
- Turn Stakes leaderboard;
- Settings/BGM/SFX;
- face editor and privacy constraints;
- node-by-node movement and parity routing.

## Next target — 0.1.30

Implement one playable Mini Game and one playable Job end-to-end after their exact rules are explicitly confirmed.

Do not silently invent final Mini Game/Job rules in the foundation milestone.

## Hard constraints

- No presentation RNG may perturb gameplay RNG.
- Do not add a temporary MatchState schema field solely for foundation UI.
- CPU remains QA-only.
- Function tiles must never deadlock replay/autoplay.
- Do not merge PR #1 or mark it Ready without Ron explicitly asking.
