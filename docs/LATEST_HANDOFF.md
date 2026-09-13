# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.34 — One-Lap Clarity + Ready Celebration (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.34`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.34_PROGRESS.md`
3. `docs/PLAYTEST_0.1.34.md`
4. `docs/MVP_0.1.33_PROGRESS.md`
5. `docs/PLAYTEST_0.1.33.md`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/scenes/TurnStakesBoardScene.ts`
8. `src/scenes/PresentationParityBoardScene.ts`
9. `src/core/demoMatch.ts`
10. `src/core/replay.ts`
11. `src/core/matchState.ts`
12. `src/core/checksum.ts`
13. `src/core/types.ts`
14. `tests/demo-match-shell.ts`
15. `tests/replay-determinism.ts`

## What changed in 0.1.34

### Lap-native HUD
- The compact stakes HUD now reads authoritative lap progress directly instead of calculating legacy `Vòng 1/3`, `2/3`, `3/3` copy from turn count.
- Main progress line: `HOÀN THÀNH 1 VÒNG • X/4`.
- Every B$ leaderboard row now shows lap state:
  - `🏁0/1` before the required lap is complete;
  - `🏁✓` after the player has completed the required first lap.
- B$ ranking remains based on money only; lap status is informational.

### READY completion feedback
- When a player crosses READY for the first required lap, a temporary banner announces `🏁 <PLAYER> HOÀN THÀNH 1 VÒNG!`.
- Banner detail shows current table progress such as `2/4 người đã đủ vòng`.
- The banner is presentation-only and does not change RNG, movement, money, Job results, turn order or checksum.
- Snapshot/resync does not replay the completion banner.

### Build-label robustness
- The current scene can promote inherited 0.1.30 / 0.1.31 / 0.1.33 labels directly to the 0.1.34 visible build badge.

## Retained 0.1.33 fixes

### Stable token motion
- Normal state packets do not own token coordinates during ordinary play.
- Token movement is driven by queued `move_step` presentation only.
- Card/News/state updates must not snap P1 backward then fly it forward again.
- Snapshot resync and rematch command #0 retain hard-snap authority.

### One full lap before scoring
- Every player starts with `lapsCompleted = 0`.
- Crossing Ready/start increments lap count and still pays current Job salary.
- Match does not end by the old fixed 3-round / 12-turn rule.
- Final B$ scoring happens only after **all players have completed at least one full board lap**.
- Highest B$ wins; equal B$ remains a shared win.
- `lapsCompleted` remains gameplay-critical and checksum-covered.

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
- Snapshot resync must not replay stale presentation.
- Result/ranking waits for final presentation to clear.
- Dice presentation always displays authoritative result.
- Approved BGM remains checksum-locked and must not be re-encoded/substituted.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.

## Validated artifact

GitHub Actions run: `34772895816` / run `#956`

Validated runtime head SHA:
`f6431f8523bdb10cd438e84ca103a7a7d449009d`

Artifact:
`mememe-playtest-0.1.34`

Artifact ID:
`10321679066`

Size:
`8,518,701 bytes`

Digest:
`sha256:3aa3513b6ea14757026b520340aa52cca46f16b7886830a2956a52d4accd1f29`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34772895816`

Full CI passed through artifact upload, including build/typecheck, replay, lockstep, host/client resync, authority, two-tab core, one-lap demo shell/rematch, CPU autoplay, presentation/board regressions, Settings/audio, economy/tactical/function-tile/direct-dice/Job-MiniGame tests and package validation.

## Current runtime-test focus

1. Check `🏁0/1` → `🏁✓` transition on the B$ leaderboard when each player first crosses Ready.
2. Check the lap-complete banner appears once and does not block turn flow.
3. Confirm snapshot/resync does not replay a stale completion banner.
4. Re-test P1 after long movement + Card/News and confirm no snap-back/fly-forward correction.
5. Confirm final B$ score still waits for the last unfinished player to complete lap 1.
6. Confirm salary and lap counting still happen together exactly once per Ready crossing.

## Deferred until exact rules are defined

- Jail skipped-turn / bail / escape mechanics.
- Mini Game B$ reward/penalty.
- Deeper Job-specific mechanical traits.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.34_PROGRESS.md và docs/PLAYTEST_0.1.34.md. Current validated artifact là mememe-playtest-0.1.34, run #956, runtime SHA f6431f8523bdb10cd438e84ca103a7a7d449009d. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
