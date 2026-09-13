# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

## Current milestone

**MVP 0.1.29 — Mini Game + Job Tile Foundation (ACTIVE / PLAYTEST PACKAGED)**

Latest artifact: `mememe-playtest-0.1.29`

Read first:
1. `docs/MVP_0.1.29_PROGRESS.md`
2. `docs/PLAYTEST_0.1.29.md`
3. `src/core/functionTiles.ts`
4. `src/content/core/function_tiles_mvp.json`
5. `src/content/city/board_city_mvp.json`
6. `src/core/types.ts`
7. `src/core/replay.ts`
8. `src/ui/presentationModel.ts`
9. `src/scenes/TacticalChoiceBoardScene.ts`
10. `tests/function-tiles-029.ts`
11. `src/core/testBot.ts`
12. `src/ui/npcChatPolicy.ts`
13. `tests/tactical-choice-027.ts`
14. `src/core/authority.ts`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.29 summary

Board nodes now support optional function-space metadata:
- `feature: minigame | job`
- `contentId`

Current placements:
- node 9 → `MINIGAME_SLOT_01`
- node 12 → `JOB_SLOT_01`

The active board visibly shows a 🎮 Mini Game tile and a 💼 Job tile.

`src/core/functionTiles.ts` resolves foundation behavior deterministically. Landing on either tile emits `minigame_tile` or `job_tile`, shows a compact presentation, applies no reward/penalty yet, consumes no extra RNG, and returns to normal turn flow.

No new command type, TurnPhase, or MatchState schema field was added. CPU autoplay therefore cannot deadlock on an unimplemented function tile.

New regression:

`npm run test:function-tiles`

It locks board content hooks, presentation, zero-RNG foundation resolution, replay return to `PRE_ROLL_ACTION`, and host-authority acceptance.

## Retained from previous milestones

- 200 B$ starting wallet and economy scaling
- READY +100 B$
- Tactical Choice / Kèo Hai Cửa
- rare deterministic CPU Card quirk
- CPU/NPC chat duration 2.5×
- live B$ leaderboard and money deltas
- node-by-node movement and parity routing
- Settings, BGM/SFX and face editor/privacy behavior

## Validated artifact

GitHub Actions run: `34767107822` / run `#748`

Head SHA: `210a45352efd1ddde74138ec649a786f0fc9962b`

Artifact: `mememe-playtest-0.1.29`

Digest: `sha256:ab5523216dad940ed3640652050b4d721296bcefe63486467246834ac89f772c`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34767107822`

Full CI passed through artifact upload, including Mini Game + Job foundation, replay, authority, two-tab, CPU autoplay and all earlier regressions.

## Next work — 0.1.30

Build the first playable Mini Game and first playable Job end-to-end.

Before coding their actual reward/input rules, explicitly confirm the designs with Ron rather than inventing missing rules.

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
