# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.45 - Remote Roll For Order**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34807583109` / run `#1337`

Validated runtime/package SHA:
`4842257bafbdffbdf4fab929d49582aa7b52671d`

Artifact:
`mememe-playtest-0.1.45`

Artifact ID:
`10333851442`

Artifact size:
`8,565,566 bytes`

Digest:
`sha256:747411d7d031fea47ab36edfc367894d22ed35abf05b858498129631560eb67f`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34807583109`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.45_PROGRESS.md`
4. `docs/PLAYTEST_0.1.45.md`
5. `src/core/turnOrderSession.ts`
6. `src/scenes/TurnOrderScene.ts`
7. `tests/remote-roll-order-045.ts`
8. `src/scenes/CareerMinigameBoardScene045.ts`
9. `src/scenes/CareerMinigameBoardScene044.ts`
10. `src/scenes/CareerMinigameBoardScene043.ts`
11. `src/scenes/CareerMinigameBoardScene042.ts`
12. `src/scenes/CareerMinigameBoardScene041.ts`

## 0.1.45 Remote Roll For Order

- JOIN client now enters `TurnOrderScene` instead of skipping directly to `DemoBoardScene`.
- HOST/CLIENT use a dedicated pregame BroadcastChannel authority session.
- HOST syncs player names only; original face files remain local and are not transferred.
- Host waits for at least one remote seat before beginning the 2-tab ceremony, then locks seat claims.
- Remote client sends only click intent + prompt identity; client never supplies a D6 result.
- Host validates room/client/seat/prompt, generates D6, and broadcasts the authoritative result.
- Unclaimed seats remain host-controlled.
- Duplicate/stale remote clicks do not consume another host D6.
- Remote seat cannot roll another player's prompt.
- Tie group is host-announced; only tied seats reroll, including remote rerolls from the remote tab.
- Final playOrder is host-broadcast and applied on client before board entry.
- HOST alone sends `start_match` after final order; client waits.
- Pregame roll randomness remains outside gameplay RNG state.

## Retained final-result chain

- 0.1.44 result controls remain blocked until podium reveal fully completes.
- 0.1.43 reveals displayed rank `4 → 3 → 2 → 1`; equal ranks reveal together.
- 0.1.42 face reactions and tied-winner crown/sparks remain intact.
- 0.1.41 B$/ranking remains authoritative and equal B$ uses competition ranking.
- 0.1.40 HUD/shell/log remains lap-native.
- Final Mini Game payout still resolves before final scoring.
- Victory SFX remains one-shot.

## Core invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- Roll For Order: high D6 first; only tied seats reroll.
- Mandatory Job Hub with Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Mini Game payout remains host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Normal state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens; Job Hub reconciles the human token.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## CI note

Run #1335 failed only on a new static test string mismatch (`session.announceTie` vs actual `hostSession?.announceTie`). Dynamic protocol behavior had passed. The assertion was corrected without weakening runtime authority. Run #1337 is the validated checkpoint.

## Runtime test focus

1. HOST + JOIN: remote seat must roll from its own tab and both tabs must reveal the same host-generated D6.
2. Observe a tie involving the remote seat and verify only tied seats reroll.
3. Spam remote roll and verify one prompt produces one D6 only.
4. Confirm client waits for HOST `VÀO TRẬN` after final order.
5. SOLO/CPU Roll For Order must remain unchanged.
6. Finish a full match and verify final Mini Game payout + podium chain remains unchanged.
7. Re-check P1 movement, Job token reconcile, eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.45_PROGRESS.md và docs/PLAYTEST_0.1.45.md. Current validated artifact là mememe-playtest-0.1.45, run #1337, runtime SHA 4842257bafbdffbdf4fab929d49582aa7b52671d. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
