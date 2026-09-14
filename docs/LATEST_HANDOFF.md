# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.42 - Podium Face Reactions + Winner Spotlight (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.42`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.42_PROGRESS.md`
3. `docs/PLAYTEST_0.1.42.md`
4. `src/scenes/CareerMinigameBoardScene042.ts`
5. `src/ui/podiumFaceReaction.ts`
6. `src/scenes/CareerMinigameBoardScene041.ts`
7. `src/ui/podiumRanking.ts`
8. `src/scenes/CareerMinigameBoardScene040.ts`
9. `src/scenes/CareerMinigameBoardScene039.ts`
10. `src/scenes/CareerMinigameBoardScene037.ts`
11. `src/scenes/CareerMinigameBoardScene.ts`
12. `tests/podium-face-reaction-042.ts`
13. `tests/final-podium-041.ts`
14. `tests/legacy-shell-copy-040.ts`
15. `tests/minigame-authority-037.ts`

## What changed in 0.1.42

### Podium face reactions

`CareerMinigameBoardScene042` extends the 0.1.41 authoritative podium and changes presentation only.

Displayed-rank mapping:

- rank 1 prefers `happy`;
- ranks 2/3 use `neutral`;
- rank 4 prefers `angry`.

The existing `gameSession.getFace()` neutral fallback remains in force, so a missing reaction sticker never changes result logic or breaks the podium.

### Winner spotlight

Every displayed rank-1 podium entry receives fixed crown/spark decoration. Spotlight is based on displayed rank rather than array position, so all first-place ties receive the same treatment.

The spotlight uses fixed coordinates and adds no random generation, gameplay commands, wallet changes, winner recomputation or authority mutation.

### Testable presentation helpers

`src/ui/podiumFaceReaction.ts` contains pure deterministic face/spotlight mapping so Node CI can validate 0.1.42 without importing Phaser.

`tests/podium-face-reaction-042.ts` locks face mapping, tied-winner spotlight, inheritance, runtime wiring and no-gameplay-mutation invariants.

`tests/final-podium-041.ts` was made current-wrapper agnostic while still protecting authoritative podium sourcing and tie behavior.

## Retained final result behavior

- 0.1.41 ranking/B$ remains sourced from `demoMatchResult(internals.match)`.
- Player names remain sourced from authoritative `MatchState`.
- Equal B$ retains competition ranking and equal podium height.
- 0.1.40 visible HUD/shell/log copy remains lap-native.
- PresentationParity still defers final result while presentation blocks.
- Pending final Mini Game payout resolves before scoring.
- 0.1.39 still shows `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` before podium reveal.
- Hidden result controls remain blocked during the lock beat.
- Victory SFX remains one-shot.

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

GitHub Actions run: `34804709294` / run `#1241`

Validated runtime/package SHA:
`0b0fc74b0d1c8795f8af426371a8ccc0f0acd208`

Artifact:
`mememe-playtest-0.1.42`

Artifact ID:
`10332517930`

Size:
`8,561,602 bytes`

Digest:
`sha256:c0d69e6119558892957df5cc95a3beb36bdae41f9e457800b9c88ceb1611eb65`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34804709294`

Full CI passed through package validation and artifact upload, including the new podium face-reaction/winner-spotlight regression.

## Runtime test focus

1. Setup all three expressions and verify rank-based face choice at final podium.
2. Verify missing reaction faces safely fall back to neutral.
3. Verify every first-place tie receives the same crown/sparks.
4. Confirm podium reaction never changes authoritative B$, rank or winner state.
5. Finish with a final Mini Game and verify payout commits before the lock/podium chain.
6. Rematch and verify a fresh reaction set is built from the new result.
7. Re-check P1 movement snap-back fix, Job token reconcile, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.42_PROGRESS.md và docs/PLAYTEST_0.1.42.md. Current validated artifact là mememe-playtest-0.1.42, run #1241, runtime SHA 0b0fc74b0d1c8795f8af426371a8ccc0f0acd208. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
