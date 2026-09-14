# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.41 - Authoritative Final Podium**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34804272675` / run `#1209`

Validated runtime/package SHA:
`9c6bb6a4b0080d4d2599cc142bf27ec45c6fa92e`

Artifact:
`mememe-playtest-0.1.41`

Artifact ID:
`10332816906`

Artifact size:
`8,561,263 bytes`

Digest:
`sha256:86170b85522a7b888b5e3a5864a753febb6a6e8328c19b14397a2fda9e0ff82b`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804272675`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.41_PROGRESS.md`
4. `docs/PLAYTEST_0.1.41.md`
5. `src/scenes/CareerMinigameBoardScene041.ts`
6. `src/ui/podiumRanking.ts`
7. `src/scenes/CareerMinigameBoardScene040.ts`
8. `src/scenes/CareerMinigameBoardScene039.ts`
9. `src/scenes/CareerMinigameBoardScene037.ts`
10. `src/scenes/CareerMinigameBoardScene.ts`
11. `src/ui/MiniGameOverlay.ts`
12. `tests/final-podium-041.ts`
13. `tests/legacy-shell-copy-040.ts`
14. `tests/final-result-transition-039.ts`
15. `tests/minigame-authority-037.ts`

## 0.1.41 authoritative final podium

- Runtime now uses `CareerMinigameBoardScene041`.
- The podium replaces the old text-heavy final ranking only after the real authoritative result overlay is eligible.
- Ranking and B$ come from `demoMatchResult(internals.match)`.
- Player names come from authoritative `MatchState` players.
- Face sticker is presentation-only: local neutral runtime face if present, otherwise P1/P2/P3/P4 fallback.
- Equal B$ uses competition ranking and equal podium height.
- `300 / 300 / 250 / 200` displays ranks `1 / 1 / 3 / 4`.
- `300 / 250 / 250 / 200` displays ranks `1 / 2 / 2 / 4`.
- Podium joins `shellOverlay` and inherits the hidden alpha from the 0.1.39 B$ lock beat, then fades in with the actual result overlay.
- No gameplay/system intent, wallet mutation, result recomputation or RNG is added.

## Retained final-result chain

- 0.1.40 keeps inherited HUD/shell/log copy lap-native.
- PresentationParity defers final result until queued presentation clears.
- Pending final Mini Game payout must resolve before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` first.
- Hidden result controls remain input-blocked during that reveal beat.
- Victory SFX remains one-shot and is not duplicated by 0.1.41.

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

## CI note

The first 0.1.41 attempt failed only on a Phaser `Container.add()` TypeScript signature in new podium avatar code. It was corrected to array-form `add([...])`. Run #1209 is the fully validated checkpoint.

## Runtime test focus

1. Finish a normal SOLO match and confirm all four podium entries show exact final B$.
2. Verify configured neutral face stickers appear; missing faces use the P-number fallback.
3. Create/observe a tie and verify equal medal + equal podium height.
4. Finish with the last required lap on Mini Game and confirm payout lands before the lock beat and podium.
5. Rematch and confirm a fresh podium builds from the new result.
6. Re-test P1 movement + Card/News no snap-back and Job Hub token reconcile.
7. Re-check all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.41_PROGRESS.md và docs/PLAYTEST_0.1.41.md. Current validated artifact là mememe-playtest-0.1.41, run #1209, runtime SHA 9c6bb6a4b0080d4d2599cc142bf27ec45c6fa92e. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
