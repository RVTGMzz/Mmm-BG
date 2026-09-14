# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.41 - Authoritative Final Podium (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.41`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.41_PROGRESS.md`
3. `docs/PLAYTEST_0.1.41.md`
4. `src/scenes/CareerMinigameBoardScene041.ts`
5. `src/ui/podiumRanking.ts`
6. `src/scenes/CareerMinigameBoardScene040.ts`
7. `src/scenes/CareerMinigameBoardScene039.ts`
8. `src/scenes/CareerMinigameBoardScene037.ts`
9. `src/scenes/CareerMinigameBoardScene.ts`
10. `src/ui/MiniGameOverlay.ts`
11. `src/core/demoMatch.ts`
12. `tests/final-podium-041.ts`
13. `tests/legacy-shell-copy-040.ts`
14. `tests/final-result-transition-039.ts`
15. `tests/minigame-authority-037.ts`

## What changed in 0.1.41

### Authoritative final podium

The old text-heavy final ranking is replaced by a four-seat podium, but the underlying result source is unchanged.

`CareerMinigameBoardScene041`:

- calls `demoMatchResult(internals.match)` for authoritative ranking/B$;
- reads displayed names from authoritative `MatchState` players;
- reuses the local neutral face sticker when available, otherwise shows P1/P2/P3/P4;
- supports equal-B$ presentation with competition ranking;
- assigns equal displayed rank the same podium height;
- joins the real `shellOverlay` and inherits its alpha so it remains hidden during the 0.1.39 B$ lock beat;
- submits no gameplay/system command and mutates no wallet/ranking state.

Tie examples:

- `300 / 300 / 250 / 200` → `1 / 1 / 3 / 4`;
- `300 / 250 / 250 / 200` → `1 / 2 / 2 / 4`.

The pure display-rank helper lives in `src/ui/podiumRanking.ts` so Node CI can validate tie behavior without importing Phaser.

### Regression

`tests/final-podium-041.ts` validates authoritative result sourcing, MatchState names, tie ranks, podium-height behavior, final-result inheritance and no gameplay/RNG mutation.

`tests/legacy-shell-copy-040.ts` was made version-agnostic so it continues to protect its own lap-native invariant without blocking later wrapper scenes.

## Retained final-result chain

- 0.1.40 keeps visible HUD/shell/log copy lap-native.
- PresentationParity defers final result while queued presentation is blocking.
- Pending final Mini Game payout must resolve first.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG`.
- Result controls stay input-blocked while hidden.
- 0.1.41 podium then fades in with the authoritative result overlay.
- Victory SFX remains tied to the real result overlay and is not duplicated.

## Retained Mini Game / audio behavior

- Mini Game payout is host-system owned and one-shot per source event.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- RPS 1v1 animation remains visible for CPU vs CPU.
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

GitHub Actions run: `34804272675` / run `#1209`

Validated runtime/package SHA:
`9c6bb6a4b0080d4d2599cc142bf27ec45c6fa92e`

Artifact:
`mememe-playtest-0.1.41`

Artifact ID:
`10332816906`

Size:
`8,561,263 bytes`

Digest:
`sha256:86170b85522a7b888b5e3a5864a753febb6a6e8328c19b14397a2fda9e0ff82b`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804272675`

Full CI passed through package validation and artifact upload, including the new authoritative podium/tie regression.

## Runtime test focus

1. Finish a normal SOLO match and inspect all four podium entries against final B$ state.
2. Verify configured neutral face stickers and P-number fallbacks.
3. Verify equal B$ produces equal medal/rank and equal podium height.
4. Finish with a final Mini Game and verify payout commits before B$ lock/podium reveal.
5. Rematch and verify the next match produces a fresh podium.
6. Re-check P1 movement snap-back fix and Job Hub token reconcile.
7. Re-check all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.41_PROGRESS.md và docs/PLAYTEST_0.1.41.md. Current validated artifact là mememe-playtest-0.1.41, run #1209, runtime SHA 9c6bb6a4b0080d4d2599cc142bf27ec45c6fa92e. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
