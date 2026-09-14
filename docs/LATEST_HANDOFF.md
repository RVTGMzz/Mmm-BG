# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.43 - Podium Low → High Reveal (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.43`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.43_PROGRESS.md`
3. `docs/PLAYTEST_0.1.43.md`
4. `src/scenes/CareerMinigameBoardScene043.ts`
5. `src/ui/podiumReveal.ts`
6. `src/scenes/CareerMinigameBoardScene042.ts`
7. `src/ui/podiumFaceReaction.ts`
8. `src/scenes/CareerMinigameBoardScene041.ts`
9. `src/ui/podiumRanking.ts`
10. `src/scenes/CareerMinigameBoardScene040.ts`
11. `src/scenes/CareerMinigameBoardScene039.ts`
12. `tests/podium-reveal-043.ts`
13. `tests/podium-face-reaction-042.ts`
14. `tests/final-podium-041.ts`
15. `tests/minigame-authority-037.ts`

## What changed in 0.1.43

### Podium reveal cadence

`CareerMinigameBoardScene043` extends 0.1.42 and changes presentation only.

- displayed rank 4 reveals first;
- rank 3 follows;
- rank 2 follows;
- rank 1 reveals last;
- equal displayed ranks use the same deterministic delay and therefore reveal together;
- each slot starts hidden with a fixed 14px vertical offset and uses a fixed `Back.easeOut` tween.

The rank-to-delay mapping lives in `src/ui/podiumReveal.ts`. It uses fixed constants only. There is no `Math.random`, gameplay RNG, result recomputation, wallet mutation, player/system intent or authority change.

### Podium slot structure

0.1.41 now builds each player podium entry inside its own presentation container while preserving the same authoritative ranking/B$ source. This gives 0.1.43 a safe animation target without moving gameplay data into the presentation layer.

0.1.42 reaction faces and winner spotlight remain inherited. Its regression is version-agnostic so later wrappers can preserve the behavior without false version failures.

## Retained final result behavior

- Podium B$ and ranking still come from `demoMatchResult(internals.match)`.
- Display names still come from authoritative `MatchState`.
- Equal B$ still uses competition ranking and equal podium height.
- Rank 1 prefers happy face; rank 4 prefers angry; middle ranks neutral; missing reactions fall back to neutral.
- All tied first-place entries receive the same crown/sparks.
- 0.1.40 HUD/shell/log copy remains lap-native.
- PresentationParity defers final result while queued presentation blocks.
- Pending final Mini Game payout resolves before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` before podium reveal.
- Victory SFX remains one-shot.

## Retained Mini Game / audio behavior

- Mini Game payout is host-system owned and one-shot per source event.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM is approved checksum-locked `03_City_Silly.ogg`.
- Four approved BGM assets must not be re-encoded/substituted.
- Eight supplied SFX remain packaged/checksum-verified: victory, news, card, step, money loss, money gain, dice, choice.

## Retained movement / scoring rules

- Normal state packets do not own token coordinates during ordinary movement presentation.
- Snapshot resync and rematch command #0 may hard-snap to authoritative nodes.
- Human Job Hub explicitly reconciles token position.
- Every player must complete at least one physical lap before final B$ scoring.
- Crossing READY pays current Job salary and increments lap exactly once.
- If the last required lap lands on a Mini Game, final result waits for its payout.

## Core invariants / deferred mechanics

- Roll For Order: highest D6 acts first; only tied seats reroll.
- Stable player ID, face, color and ownership do not move with play order.
- Starting wallet `200 B$`.
- Mandatory Job Hub, three unique A/B/C offers, Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot.
- Thief may become `jailed`, but skipped-turn / bail / escape mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34805635514` / run `#1273`

Validated runtime/package SHA:
`ef63cd6deeddbd59a8c7eaaf2e6e1840aa518314`

Artifact:
`mememe-playtest-0.1.43`

Artifact ID:
`10332634348`

Size:
`8,560,703 bytes`

Digest:
`sha256:28b19183809fa5174eb89f63a66b613c26ce1d30b92256734d6f9ff999ddac27`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34805635514`

Full CI passed through package validation and artifact upload, including the new deterministic podium reveal regression.

## Runtime test focus

1. Finish a normal match and verify low-to-high reveal ordering.
2. Observe/create a tie and verify tied slots appear simultaneously.
3. Confirm the winner/crown remains the final reveal beat.
4. Confirm rank-based face reactions remain correct.
5. Finish with a final Mini Game and verify payout commits before B$ lock/podium reveal.
6. Rematch and verify a fresh reveal runs from the new result.
7. Re-check P1 movement snap-back fix, Job token reconcile, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.43_PROGRESS.md và docs/PLAYTEST_0.1.43.md. Current validated artifact là mememe-playtest-0.1.43, run #1273, runtime SHA ef63cd6deeddbd59a8c7eaaf2e6e1840aa518314. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
