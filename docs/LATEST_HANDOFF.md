# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.45 - Remote Roll For Order (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.45`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.45_PROGRESS.md`
3. `docs/PLAYTEST_0.1.45.md`
4. `src/core/turnOrderSession.ts`
5. `src/scenes/TurnOrderScene.ts`
6. `tests/remote-roll-order-045.ts`
7. `src/scenes/CareerMinigameBoardScene045.ts`
8. `src/scenes/CareerMinigameBoardScene044.ts`
9. `src/scenes/CareerMinigameBoardScene043.ts`
10. `src/scenes/CareerMinigameBoardScene042.ts`
11. `src/scenes/CareerMinigameBoardScene041.ts`

## What changed in 0.1.45

### Remote Roll For Order authority

Roll For Order now has a dedicated pregame two-tab authority channel.

- JOIN enters the ceremony rather than skipping directly to the board.
- Client claims P2/P3/P4 for the ceremony.
- Host syncs player names only; original face files remain local.
- Host waits for at least one remote seat, then locks ceremony seat claims.
- Each prompt identifies exactly one seat.
- Remote client sends only a roll request for the active prompt; it never chooses the D6 value.
- Host validates client/seat/prompt ownership, generates D6, and broadcasts the result.
- Unclaimed seats remain host-controlled.
- Duplicate/stale client clicks cannot consume another host roll.
- Host announces tie groups and only tied players reroll.
- Host broadcasts the final `playOrder`; client applies the same order before board entry.
- Host alone sends the final `start_match` release.

The pregame authority uses a separate random source and does not consume the gameplay RNG state.

### Regression

`tests/remote-roll-order-045.ts` validates remote seat claim, host-generated D6, duplicate protection, seat isolation, tie broadcast, final-order/start sync, late-join rejection, JOIN routing, and retention of the 0.1.44 board inheritance chain.

The first 0.1.45 CI attempt (#1335) failed only because a source-string assertion expected `session.announceTie(...)` while the scene uses `hostSession?.announceTie(...)`. Dynamic protocol assertions were already passing. The test string was corrected without changing authority behavior.

## Retained result/gameplay behavior

- 0.1.44 result buttons remain blocked until podium reveal completes.
- 0.1.43 podium reveal remains `4 → 3 → 2 → 1`, equal ranks together.
- 0.1.42 face reactions and tied-winner spotlight remain intact.
- 0.1.41 authoritative B$/ranking and competition ranks remain intact.
- 0.1.40 visible HUD/shell/log copy remains lap-native.
- Final Mini Game payout resolves before final B$ scoring.
- Starting wallet remains `200 B$`.
- Every player completes one physical lap before final scoring.
- READY pays current Job salary exactly once per crossing and increments lap.
- Mandatory Job Hub uses Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct RPS payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain checksum-protected.
- Movement presentation, snapshot/rematch snap rules, Job token reconcile and eventLog/checksum rules remain unchanged.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34807583109` / run `#1337`

Validated runtime/package SHA:
`4842257bafbdffbdf4fab929d49582aa7b52671d`

Artifact:
`mememe-playtest-0.1.45`

Artifact ID:
`10333851442`

Size:
`8,565,566 bytes`

Digest:
`sha256:747411d7d031fea47ab36edfc367894d22ed35abf05b858498129631560eb67f`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34807583109`

Full CI passed through build/typecheck, all existing gameplay/network/presentation regressions, Remote Roll authority regression, package verification, guide copy and artifact upload.

## Runtime test focus

1. HOST + JOIN: verify the remote seat gets the D6 button on its own tab.
2. Verify both tabs reveal the exact same host-generated D6.
3. Observe a tie involving remote seat and verify only tied seats reroll.
4. Spam remote roll and confirm one prompt means one D6.
5. Confirm client waits for HOST after final order.
6. Verify SOLO/CPU Roll For Order still behaves exactly as before.
7. Finish a full match and re-check final payout/podium, P1 movement, Job token reconcile, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.45_PROGRESS.md và docs/PLAYTEST_0.1.45.md. Current validated artifact là mememe-playtest-0.1.45, run #1337, runtime SHA 4842257bafbdffbdf4fab929d49582aa7b52671d. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
