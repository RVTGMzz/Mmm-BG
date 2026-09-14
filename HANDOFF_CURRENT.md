# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.44 - Result Controls Unlock After Podium**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34806052282` / run `#1303`

Validated runtime/package SHA:
`08fccea74a9399da289e86a057a0fce7be291292`

Artifact:
`mememe-playtest-0.1.44`

Artifact ID:
`10333470000`

Artifact size:
`8,560,852 bytes`

Digest:
`sha256:8776e38b812576f83ad5ee78a50bf1601476a6bf9f22efb59aa4c92192cc7bb8`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34806052282`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.44_PROGRESS.md`
4. `docs/PLAYTEST_0.1.44.md`
5. `src/scenes/CareerMinigameBoardScene044.ts`
6. `src/scenes/CareerMinigameBoardScene043.ts`
7. `src/ui/podiumReveal.ts`
8. `src/scenes/CareerMinigameBoardScene042.ts`
9. `src/scenes/CareerMinigameBoardScene041.ts`
10. `src/scenes/CareerMinigameBoardScene040.ts`
11. `src/scenes/CareerMinigameBoardScene039.ts`
12. `tests/podium-result-gate-044.ts`
13. `tests/podium-reveal-043.ts`
14. `tests/podium-face-reaction-042.ts`
15. `tests/final-podium-041.ts`

## 0.1.44 result-control unlock

- Runtime uses `CareerMinigameBoardScene044`.
- Result controls remain blocked until the full 0.1.43 podium cascade has finished.
- The transparent blocker is above result controls and below the existing 0.1.39 B$ lock blocker.
- Release timing comes from `podiumRevealCompleteMs()` and fixed constants only.
- The gate resets on rematch/non-ended state and shutdown.
- No gameplay/system intent, wallet mutation, result recomputation or RNG is added.

## Retained final-result chain

- 0.1.43 podium reveals displayed rank `4 → 3 → 2 → 1`; equal ranks reveal together.
- 0.1.42 rank 1 prefers happy face, rank 4 prefers angry, middle ranks neutral; tied winners share crown/sparks.
- 0.1.41 B$ and ranking come from authoritative `demoMatchResult`; equal B$ uses competition ranking.
- 0.1.40 keeps HUD/shell/log copy lap-native.
- PresentationParity defers final result until queued presentation clears.
- Pending final Mini Game payout must resolve before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` first.
- Victory SFX remains one-shot.

## Core invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- Final Mini Game payout resolves before result.
- Roll For Order: high D6 first; only tied seats reroll.
- Mandatory Job Hub with Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Mini Game payout remains host-system owned and single-commit.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct RPS: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files and eight supplied SFX remain unchanged.
- Normal network state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens.
- Human Job Hub reconciles the token to the authoritative node.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## Runtime test focus

1. Finish a match and spam CHƠI LẠI / VỀ LOBBY during podium reveal. Nothing should happen until 🥇 finishes.
2. Confirm buttons work immediately after the reveal completes.
3. Rematch and verify the gate arms again.
4. Verify tied podium entries still reveal simultaneously.
5. Finish with final required lap on Mini Game and verify payout commits before lock/reveal.
6. Re-check P1 movement, Job token reconcile, eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.44_PROGRESS.md và docs/PLAYTEST_0.1.44.md. Current validated artifact là mememe-playtest-0.1.44, run #1303, runtime SHA 08fccea74a9399da289e86a057a0fce7be291292. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
