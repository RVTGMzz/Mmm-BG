# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.43 - Podium Low → High Reveal**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34805635514` / run `#1273`

Validated runtime/package SHA:
`ef63cd6deeddbd59a8c7eaaf2e6e1840aa518314`

Artifact:
`mememe-playtest-0.1.43`

Artifact ID:
`10332634348`

Artifact size:
`8,560,703 bytes`

Digest:
`sha256:28b19183809fa5174eb89f63a66b613c26ce1d30b92256734d6f9ff999ddac27`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34805635514`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.43_PROGRESS.md`
4. `docs/PLAYTEST_0.1.43.md`
5. `src/scenes/CareerMinigameBoardScene043.ts`
6. `src/ui/podiumReveal.ts`
7. `src/scenes/CareerMinigameBoardScene042.ts`
8. `src/ui/podiumFaceReaction.ts`
9. `src/scenes/CareerMinigameBoardScene041.ts`
10. `src/ui/podiumRanking.ts`
11. `src/scenes/CareerMinigameBoardScene040.ts`
12. `src/scenes/CareerMinigameBoardScene039.ts`
13. `tests/podium-reveal-043.ts`
14. `tests/podium-face-reaction-042.ts`
15. `tests/final-podium-041.ts`
16. `tests/minigame-authority-037.ts`

## 0.1.43 podium reveal

- Runtime uses `CareerMinigameBoardScene043`.
- Podium slots are independent presentation containers inside the authoritative podium root.
- Reveal order is displayed rank `4 → 3 → 2 → 1`.
- Equal displayed ranks use the exact same delay and reveal together.
- Rank 1 therefore remains the final reveal beat without visually breaking first-place ties.
- Each slot begins hidden with a fixed 14px offset and uses a fixed `Back.easeOut` tween.
- Timing comes only from `podiumRevealDelayForRank(rank)` and fixed constants.
- No gameplay/system intent, wallet mutation, result recomputation or RNG is added.

## Retained podium/result chain

- 0.1.42: rank 1 prefers happy face, rank 4 prefers angry, middle ranks neutral; all tied rank-1 entries receive the same crown/sparks.
- 0.1.41: B$ and ranking come from `demoMatchResult`; names come from authoritative `MatchState`; equal B$ uses competition ranking and equal podium height.
- 0.1.40: visible HUD/shell/log copy remains lap-native.
- PresentationParity still defers final result until queued presentation clears.
- Pending final Mini Game payout must resolve before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` first.
- Victory SFX remains one-shot.

## Retained Mini Game / audio rules

- Mini Game payout is host-system owned and single-commit per source event.
- Nhiều ra ít bị: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM remains checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files must not be re-encoded/substituted.
- Eight supplied SFX remain checksum-verified: victory, news, card, step, money loss, money gain, dice, choice.

## Core invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY increments lap and pays current Job salary exactly once.
- Final Mini Game payout resolves before result.
- Roll For Order: high D6 first; only tied seats reroll.
- Mandatory Job Hub with Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Normal network state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens.
- Human Job Hub reconciles the token to the authoritative node.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Thief `jailed` exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.

## Runtime test focus

1. Finish a match and verify podium appears low rank → high rank.
2. Observe a tie and verify tied slots reveal simultaneously.
3. Confirm 🥇/👑 is the final reveal beat.
4. Confirm reaction faces from 0.1.42 remain correct.
5. Finish with final required lap on Mini Game and verify payout commits before lock/reveal.
6. Rematch and verify reveal runs again from the new result.
7. Re-check P1 movement, Job token reconcile, eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.43_PROGRESS.md và docs/PLAYTEST_0.1.43.md. Current validated artifact là mememe-playtest-0.1.43, run #1273, runtime SHA ef63cd6deeddbd59a8c7eaaf2e6e1840aa518314. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
