# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.46 - Job Hub Multiplayer Polish (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.46`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.46_PROGRESS.md`
3. `docs/PLAYTEST_0.1.46.md`
4. `src/scenes/CareerMinigameBoardScene046.ts`
5. `src/ui/JobChoicePicker.ts`
6. `tests/job-hub-multiplayer-046.ts`
7. `src/core/twoTabSession.ts`
8. `src/core/authority.ts`
9. `src/core/replay.ts`
10. `src/scenes/CareerMinigameBoardScene045.ts`
11. `src/core/turnOrderSession.ts`
12. `src/scenes/TurnOrderScene.ts`
13. `tests/remote-roll-order-045.ts`

## What changed in 0.1.46

### Multiplayer Job Hub presentation

`CareerMinigameBoardScene046` extends the validated 0.1.45 runtime and adds spectator presentation for remote-owned Job Hub turns.

- The controlling peer still receives the interactive Job Hub.
- Other network peers now see the same three authoritative A/B/C offers instead of only waiting on the board.
- Spectator Job Hub has no interactive Job Dice control.
- When authority resolves the Job, spectator overlay closes automatically.
- Existing `job_dice_roll` event drives the same dice presentation on every peer.
- Existing `job_selected` event shows the same Job title and Lv.1 salary on every peer.

### Authority remains unchanged

0.1.46 intentionally adds no new gameplay command. Remote Job Hub still uses `choose_job`.

Client-provided fields such as `jobId`, `result`, or `offerIndex` are discarded by host authority. The accepted `choose_job` command contains empty data. Replay consumes host gameplay RNG, produces one authoritative Job D6, and maps it with the existing rule `1–2 A / 3–4 B / 5–6 C`.

### Regression

`tests/job-hub-multiplayer-046.ts` runs a real in-memory P2 remote-seat flow through TwoTab sessions and checks:

- mandatory Job Hub stop;
- three host-authoritative offers;
- forged client result/Job fields discarded;
- host/client agree on Job D6 and assigned Job;
- shared dice presentation ends on authoritative D6;
- assigned Job presentation contains Job and Lv.1 salary;
- spectator UI cannot roll locally;
- Job picker contains no `Math.random` or local `rollD6`.

The old 0.1.45 Remote Roll test was made version-agnostic after the first 0.1.46 run exposed its hardcoded Lobby/Setup version assertion.

## Retained gameplay/result behavior

- 0.1.45 Remote Roll For Order remains host-authoritative.
- Mandatory Job Hub stop and Job D6 mapping remain unchanged.
- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary once per crossing and increments lap.
- Mini Game payout remains host-system owned and one-shot.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Movement presentation/snapshot/rematch rules remain unchanged.
- Final podium/result-input chain remains unchanged.
- Original face files remain local.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34809081463` / run `#1367`

Validated runtime/package SHA:
`6d59583f8e1896fb2b0cbb12e438cc85b0b6fb7a`

Artifact:
`mememe-playtest-0.1.46`

Artifact ID:
`10334430551`

Size:
`8,565,865 bytes`

Digest:
`sha256:2b7b66df3863721f12fd07ff56dc7a43ed55a5d4850af554b02f86f5f04a0bf4`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34809081463`

Full CI passed build/typecheck, replay/lockstep, host-client/two-tab authority, all gameplay/presentation regressions, Remote Roll authority, Job Hub multiplayer authority/presentation, package verification, guide copy and artifact upload.

## CI note

Run #1365 failed only because `tests/remote-roll-order-045.ts` still required the current entry surfaces to literally display `0.1.45`. The runtime and all preceding regressions were green. That test now protects only 0.1.45 Remote Roll behavior instead of owning the current build number.

## Runtime test focus

1. Reach Job Hub with a remote-owned seat and verify both tabs display the same three offers.
2. Confirm only the remote owner can press Job Dice.
3. Confirm both peers reveal the exact same D6, assigned Job and salary.
4. Verify the spectator overlay clears after authority resolves the Job.
5. Repeat Job Hub later in the match to catch stale overlay state.
6. Re-check Remote Roll For Order, full-match Mini Game payout, final podium, P1 movement, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.46_PROGRESS.md và docs/PLAYTEST_0.1.46.md. Current validated artifact là mememe-playtest-0.1.46, run #1367, runtime SHA 6d59583f8e1896fb2b0cbb12e438cc85b0b6fb7a. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
