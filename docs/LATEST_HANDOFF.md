# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.40 - Lap-Native Shell Cleanup (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.40`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.40_PROGRESS.md`
3. `docs/PLAYTEST_0.1.40.md`
4. `src/scenes/CareerMinigameBoardScene040.ts`
5. `src/scenes/CareerMinigameBoardScene039.ts`
6. `src/scenes/CareerMinigameBoardScene037.ts`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/ui/MiniGameOverlay.ts`
9. `src/core/demoMatch.ts`
10. `tests/legacy-shell-copy-040.ts`
11. `tests/final-result-transition-039.ts`
12. `tests/choice-sfx-038.ts`
13. `tests/minigame-authority-037.ts`

## What changed in 0.1.40

### Lap-native inherited shell copy

The old DemoBoard shell still carries `rounds` and `turnLimit` fields for compatibility, but they have not controlled match end since the one-lap scoring change. 0.1.40 prevents those old fields from leaking back into visible runtime rules.

`CareerMinigameBoardScene040` wraps inherited presentation surfaces and normalizes:

- center HUD `Vòng x/y` into `🏁 x/4 ĐỦ VÒNG`;
- phase/debug progress into lap progress + checksum;
- static three-round helper/header copy;
- waiting shell instructions;
- ended shell copy;
- shell start/end logs.

Visible progress is derived from `demoMatchLapProgress(match)` only. The wrapper does not submit gameplay/system commands, mutate wallet state, change shell serialization or introduce randomness.

### Regression cleanup

New `tests/legacy-shell-copy-040.ts` protects the lap-native wrapper.

Older 0.1.38 Choice-SFX and 0.1.39 Final-Result regressions were made version-agnostic so later wrapper scenes can inherit those features without false CI failures.

## Retained 0.1.39 final result clarity

- PresentationParity defers final result while presentation is blocking.
- Pending final Mini Game payout must resolve first.
- The real authoritative result overlay remains the only winner/ranking truth.
- `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` remains presentation-only.
- Result buttons are blocked while visually hidden.
- Victory SFX remains one-shot on the real result overlay.

## Retained Mini Game / audio behavior

- Mini Game payout is host-system owned and one-shot per source event.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- RPS 1v1 animation remains visible for CPU vs CPU.
- Mini Game BGM is approved checksum-locked `03_City_Silly.ogg`.
- Four approved BGM assets must not be re-encoded/substituted.
- Eight supplied SFX remain packaged: victory, news, card, step, money loss, money gain, dice, choice.

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

GitHub Actions run: `34802821058` / run `#1169`

Validated runtime/package SHA:
`2544bfc1ee77bfd12fcfa1b5b08a75ccf4af41b4`

Artifact:
`mememe-playtest-0.1.40`

Artifact ID:
`10331508499`

Size:
`8,560,179 bytes`

Digest:
`sha256:003d6d9dde7bdafcd547a60e18483e5f5f068c988f719eb54e6291323063f07f`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34802821058`

Full CI passed through package validation and artifact upload, including Choice-SFX, final-result and new lap-native shell regressions.

## Runtime test focus

1. SOLO: verify every visible match-progress surface is lap-native.
2. HOST + JOIN: verify both tabs show the same lap-native shell copy.
3. Confirm no active-rule log/text says fixed 3 rounds / 12 turns.
4. Finish normally and verify the 0.1.39 final B$ transition remains intact.
5. Finish with a final Mini Game and verify payout commits before result.
6. Re-check P1 movement snap-back fix and Job Hub token reconcile.
7. Re-check all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.40_PROGRESS.md và docs/PLAYTEST_0.1.40.md. Current validated artifact là mememe-playtest-0.1.40, run #1169, runtime SHA 2544bfc1ee77bfd12fcfa1b5b08a75ccf4af41b4. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
