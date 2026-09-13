# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.33 — Stable Token Sync + One-Lap Scoring (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.33`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.33_PROGRESS.md`
3. `docs/PLAYTEST_0.1.33.md`
4. `docs/MVP_0.1.32_PROGRESS.md`
5. `docs/PLAYTEST_0.1.32.md`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/scenes/PresentationParityBoardScene.ts`
8. `src/core/demoMatch.ts`
9. `src/core/replay.ts`
10. `src/core/matchState.ts`
11. `src/core/checksum.ts`
12. `src/core/types.ts`
13. `tests/demo-match-shell.ts`
14. `tests/replay-determinism.ts`
15. `tests/authority-protocol.ts`

## 0.1.33 runtime fixes

### Stable token motion
- Fixes the visual bug where P1 could reach the correct node, then briefly snap to an older node before Card/News/next-turn presentation and fly forward again.
- During normal play, token coordinates are now owned by queued `move_step` presentation only.
- Normal host/state updates no longer hard-snap token positions or kill movement tweens.
- Snapshot resync and rematch command #0 still retain hard-snap authority.
- Gameplay node state, dice outcomes, Card effects and RNG rules are unchanged.

### Score only after one full board lap
- Every player starts with `lapsCompleted = 0`.
- Crossing Ready/start increments that player's completed-lap count.
- Match does not end by the old fixed 3-round / 12-turn rule anymore.
- Final B$ scoring happens only when **all players have completed at least one full board lap**.
- Highest B$ wins; equal B$ remains a shared win.
- `lapsCompleted` is gameplay-critical and checksum-covered.
- Old shell `rounds` / `turnLimit` fields remain only for backward compatibility and no longer control match end.

### UI / package
- Compact HUD shows `HOÀN THÀNH 1 VÒNG • X/4`.
- Waiting/result copy explains the new one-lap condition.
- `PLAYTEST.txt` and packaged `PLAYTEST_GUIDE.md` are updated for 0.1.33.

## Rules retained

- Roll For Order: D6 high goes first; only tied players reroll; stable player identity does not move.
- Mandatory Job Hub: three unique A/B/C offers; authoritative Job D6 maps `1–2 → A`, `3–4 → B`, `5–6 → C`.
- Starting wallet remains `200 B$`.
- Salary pays when crossing Ready based on current Job + level; unemployed receives `0 B$` salary but still completes the lap.
- Career promotion/steady/demotion/fired and Thief `jailed` state retained.
- Do not invent skipped-turn/bail/escape jail rules yet.
- Mini Game remains `Nhiều ra ít bị` then RPS at 1v1; B$ payout remains undefined.
- Direct dice, Tactical Choice, CPU quirk, side reaction chat, Settings/BGM/FX and rematch retained.

## Determinism / authority invariants

- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- `playOrder`, Job state/pending offers and `lapsCompleted` are checksum-covered.
- Replay determinism remains green after adding lap progress.
- Snapshot resync must not replay stale presentation.
- Result/ranking waits for final presentation to clear.
- Dice presentation always displays authoritative result.
- Approved BGM remains checksum-locked and must not be re-encoded/substituted.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.

## Validated artifact

GitHub Actions run: `34772171455` / run `#938`

Validated runtime head SHA:
`12bd0180e37a6eca39d4b1ff63cfac407281dfb6`

Artifact:
`mememe-playtest-0.1.33`

Artifact ID:
`10322258905`

Size:
`8,518,927 bytes`

Digest:
`sha256:b5d9c0c5118756528e6573d71f97c2a795ffd6938c8d45789d7a5ad6b0a6a5af`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34772171455`

Full CI passed through artifact upload, including build/typecheck, replay, lockstep, host/client resync, authority, two-tab core, one-lap demo shell/rematch, CPU autoplay, presentation/board regressions, Settings/audio, economy/tactical/function-tile/direct-dice/Job-MiniGame tests and package validation.

## Current runtime-test focus

1. Watch P1 after long rolls followed by Card/News and confirm no snap-back/fly-forward correction.
2. Confirm normal state updates never interrupt movement animation.
3. Confirm snapshot/rematch still restore token positions correctly.
4. Confirm HUD lap progress increments when crossing Ready.
5. Confirm game continues past the old turn boundary until all players finish one lap.
6. Confirm final score appears only after the last unfinished player crosses Ready.
7. Confirm salary and lap counting happen together exactly once per Ready crossing.

## Deferred until exact rules are defined

- Jail skipped-turn / bail / escape mechanics.
- Mini Game B$ reward/penalty.
- Deeper Job-specific mechanical traits.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.33_PROGRESS.md và docs/PLAYTEST_0.1.33.md. Current validated artifact là mememe-playtest-0.1.33, run #938, runtime SHA 12bd0180e37a6eca39d4b1ff63cfac407281dfb6. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
