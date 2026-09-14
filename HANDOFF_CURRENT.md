# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.46 - Job Hub Multiplayer Polish**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34809081463` / run `#1367`

Validated runtime/package SHA:
`6d59583f8e1896fb2b0cbb12e438cc85b0b6fb7a`

Artifact:
`mememe-playtest-0.1.46`

Artifact ID:
`10334430551`

Artifact size:
`8,565,865 bytes`

Digest:
`sha256:2b7b66df3863721f12fd07ff56dc7a43ed55a5d4850af554b02f86f5f04a0bf4`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34809081463`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.46_PROGRESS.md`
4. `docs/PLAYTEST_0.1.46.md`
5. `src/scenes/CareerMinigameBoardScene046.ts`
6. `src/ui/JobChoicePicker.ts`
7. `tests/job-hub-multiplayer-046.ts`
8. `src/core/twoTabSession.ts`
9. `src/core/authority.ts`
10. `src/core/replay.ts`
11. `src/scenes/CareerMinigameBoardScene045.ts`
12. `src/core/turnOrderSession.ts`
13. `src/scenes/TurnOrderScene.ts`
14. `tests/remote-roll-order-045.ts`

## 0.1.46 Job Hub Multiplayer Polish

- Remote-owned Job Hub seats now have multiplayer presentation parity.
- The controlling peer keeps the interactive Job Hub and submits the existing empty `choose_job` intent.
- Non-controlling network peers see the same three authoritative A/B/C Job offers in spectator mode.
- Spectator Job Hub cannot submit input.
- Client never chooses the Job ID, D6 result or offer index.
- Host gameplay authority alone consumes the existing gameplay RNG for Job D6.
- Mapping remains `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Authoritative `job_dice_roll` drives the shared dice presentation on host/client.
- Authoritative `job_selected` carries Job title and Lv.1 salary to both peers.
- Spectator overlay closes when the authoritative state exits `JOB_CHOICE`.
- Mandatory Job Hub stop is unchanged.

## Retained 0.1.45 Remote Roll For Order

- JOIN enters `TurnOrderScene` before board entry.
- Remote client sends only roll request + prompt identity; host generates D6.
- Duplicate/stale remote clicks cannot consume another host roll.
- Remote seats cannot roll another player's prompt.
- Tie groups are host-announced and only tied players reroll.
- Host broadcasts final `playOrder` and alone releases clients into the match.
- Pregame Roll For Order randomness remains outside gameplay RNG.

## Core invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- Mini Game payout remains host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Normal state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens; Job Hub controller reconcile remains intact.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Final podium/result-input chain from 0.1.41-0.1.44 remains unchanged.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## CI note

Run #1365 failed only because the older 0.1.45 regression hardcoded Lobby/Setup version text. Runtime build and all prior gameplay/network regressions were green. The old test was made version-agnostic without weakening Remote Roll authority. Run #1367 is the validated checkpoint.

## Runtime test focus

1. HOST + JOIN and play until the remote seat reaches Job Hub.
2. Verify both tabs show the same three A/B/C Jobs.
3. HOST/spectator must not be able to press the remote player's Job Dice.
4. Remote owner presses Job Dice; both tabs must finish on the same authoritative D6.
5. Verify assigned Job follows `1-2 A / 3-4 B / 5-6 C` and both tabs show the same Lv.1 salary.
6. Confirm Job Hub closes and turn advances cleanly.
7. Re-check Remote Roll For Order, P1 movement, Mini Game payout, eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.46_PROGRESS.md và docs/PLAYTEST_0.1.46.md. Current validated artifact là mememe-playtest-0.1.46, run #1367, runtime SHA 6d59583f8e1896fb2b0cbb12e438cc85b0b6fb7a. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
