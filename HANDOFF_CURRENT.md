# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.42 - Podium Face Reactions + Winner Spotlight**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34804709294` / run `#1241`

Validated runtime/package SHA:
`0b0fc74b0d1c8795f8af426371a8ccc0f0acd208`

Artifact:
`mememe-playtest-0.1.42`

Artifact ID:
`10332517930`

Artifact size:
`8,561,602 bytes`

Digest:
`sha256:c0d69e6119558892957df5cc95a3beb36bdae41f9e457800b9c88ceb1611eb65`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804709294`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.42_PROGRESS.md`
4. `docs/PLAYTEST_0.1.42.md`
5. `src/scenes/CareerMinigameBoardScene042.ts`
6. `src/ui/podiumFaceReaction.ts`
7. `src/scenes/CareerMinigameBoardScene041.ts`
8. `src/ui/podiumRanking.ts`
9. `src/scenes/CareerMinigameBoardScene040.ts`
10. `src/scenes/CareerMinigameBoardScene039.ts`
11. `src/scenes/CareerMinigameBoardScene037.ts`
12. `src/scenes/CareerMinigameBoardScene.ts`
13. `tests/podium-face-reaction-042.ts`
14. `tests/final-podium-041.ts`
15. `tests/minigame-authority-037.ts`

## 0.1.42 podium reactions

- Runtime now uses `CareerMinigameBoardScene042`.
- 0.1.42 extends the authoritative 0.1.41 podium and changes presentation only.
- Displayed rank 1 prefers `happy` face.
- Displayed ranks 2/3 use `neutral` face.
- Displayed rank 4 prefers `angry` face.
- `gameSession.getFace()` continues to fall back to neutral if the requested reaction sticker is missing.
- Every displayed rank-1 entry receives fixed `👑` + two `✦` decorations.
- First-place ties spotlight every tied winner equally because spotlight checks displayed rank, not array position.
- No presentation randomness, gameplay/system intent, wallet mutation, result recomputation or winner mutation is added.

## Retained 0.1.41 authoritative podium

- Podium ranking and B$ come from `demoMatchResult(internals.match)`.
- Display names come from authoritative `MatchState` players.
- Equal B$ uses competition ranks and equal podium height.
- `300 / 300 / 250 / 200` → `1 / 1 / 3 / 4`.
- `300 / 250 / 250 / 200` → `1 / 2 / 2 / 4`.
- Podium joins `shellOverlay` and inherits the 0.1.39 final-lock alpha/reveal timing.

## Retained final-result chain

- 0.1.40 keeps HUD/shell/log copy lap-native.
- PresentationParity defers final result until queued presentation clears.
- Pending final Mini Game payout must resolve before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` first.
- Hidden result controls remain input-blocked during the lock beat.
- Victory SFX remains one-shot and is not duplicated.

## Retained Mini Game / audio rules

- Mini Game payout is host-system owned and single-commit per source event.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì: `25 / 15 / 5 / 0 B$`.
- RPS 1v1 animation still runs for CPU vs CPU.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files must not be re-encoded/substituted.
- Eight supplied SFX remain: victory, news, card, step, money loss, money gain, dice, choice.

## Movement / scoring invariants

- Normal network state packets must not steal token coordinates from queued `move_step` presentation.
- Snapshot/rematch may hard-snap tokens to authoritative nodes.
- Human Job Hub reconciles the token to the authoritative Job node.
- Every player must complete at least one physical lap before final B$ scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- If the final required lap ends on a Mini Game, result waits for its payout.

## Core rules / deferred mechanics

- Starting wallet `200 B$`.
- Roll For Order: high D6 first, only tied seats reroll.
- Mandatory Job Hub with three unique A/B/C offers.
- Job D6: `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Original face files remain local.
- CPU remains a QA bot.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## Runtime test focus

1. Setup all three face expressions for at least one player and finish at rank 1 or 4.
2. Leave reaction faces missing for another player and confirm neutral fallback.
3. Observe/create a first-place tie and verify every tied winner receives the same crown/sparks.
4. Confirm reaction choice never changes B$, winner IDs, rank or podium height.
5. Finish with final required lap on Mini Game and confirm payout commits before lock/podium reveal.
6. Rematch and verify reactions rebuild from the new result.
7. Re-check P1 movement, Job token reconcile, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.42_PROGRESS.md và docs/PLAYTEST_0.1.42.md. Current validated artifact là mememe-playtest-0.1.42, run #1241, runtime SHA 0b0fc74b0d1c8795f8af426371a8ccc0f0acd208. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
