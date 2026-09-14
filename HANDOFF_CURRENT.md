# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.40 - Lap-Native Shell Cleanup**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34802821058` / run `#1169`

Validated runtime/package SHA:
`2544bfc1ee77bfd12fcfa1b5b08a75ccf4af41b4`

Artifact:
`mememe-playtest-0.1.40`

Artifact ID:
`10331508499`

Artifact size:
`8,560,179 bytes`

Digest:
`sha256:003d6d9dde7bdafcd547a60e18483e5f5f068c988f719eb54e6291323063f07f`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34802821058`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.40_PROGRESS.md`
4. `docs/PLAYTEST_0.1.40.md`
5. `src/scenes/CareerMinigameBoardScene040.ts`
6. `src/scenes/CareerMinigameBoardScene039.ts`
7. `src/scenes/CareerMinigameBoardScene037.ts`
8. `src/scenes/CareerMinigameBoardScene.ts`
9. `src/ui/MiniGameOverlay.ts`
10. `tests/legacy-shell-copy-040.ts`
11. `tests/final-result-transition-039.ts`
12. `tests/choice-sfx-038.ts`
13. `tests/minigame-authority-037.ts`

## 0.1.40 lap-native shell cleanup

- Runtime now uses `CareerMinigameBoardScene040`.
- Inherited center HUD uses authoritative lap progress `🏁 x/4 ĐỦ VÒNG`, not `Vòng x/y`.
- Inherited phase/debug copy includes lap progress + checksum rather than legacy turn-limit progress.
- Waiting/result shell copy is normalized to the one-lap rule.
- Shell logs no longer describe a fixed 3-round / 12-turn demo.
- Legacy `rounds` / `turnLimit` fields remain serialized for compatibility/debug only and are not removed in this patch.
- Visible progress derives from `demoMatchLapProgress(match)`.
- No gameplay/system intents, RNG, payouts or authority state are added by the 0.1.40 wrapper.

## Retained 0.1.39 final result behavior

- Final result stays deferred until queued presentation clears.
- Pending final Mini Game payout must resolve before scoring.
- The real result overlay remains the only winner/ranking truth.
- `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` is presentation-only.
- Hidden result buttons are input-blocked during the reveal beat.
- Victory SFX is not duplicated.

## Retained Mini Game/audio rules

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

The first 0.1.40 CI attempts exposed old presentation tests that hard-coded previous build numbers. Those tests were made version-agnostic; runtime/gameplay code was not the cause. Run #1169 is the fully validated checkpoint.

## Runtime test focus

1. SOLO: verify center HUD always shows lap progress rather than round/turn-limit progress.
2. HOST + JOIN: verify both tabs show the same lap-native shell wording.
3. Verify shell logs never surface `3 vòng / 12 lượt` as the active rule.
4. Finish normally and verify the 0.1.39 final B$ transition still occurs once.
5. Finish with final landing on Mini Game and verify payout arrives before result.
6. Re-test P1 movement + Card/News no snap-back and Job Hub token reconcile.
7. Re-check all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.40_PROGRESS.md và docs/PLAYTEST_0.1.40.md. Current validated artifact là mememe-playtest-0.1.40, run #1169, runtime SHA 2544bfc1ee77bfd12fcfa1b5b08a75ccf4af41b4. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
