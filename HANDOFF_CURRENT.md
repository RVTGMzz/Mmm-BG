# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.39 - Final B$ Lock + Result Clarity**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34801911635` / run `#1139`

Validated runtime/package SHA:
`86764fa9aeda89067cb1abd29703985f5c993c04`

Artifact:
`mememe-playtest-0.1.39`

Artifact ID:
`10330908906`

Artifact size:
`8,558,543 bytes`

Digest:
`sha256:2c7332429a1432bfb278bc2fef7e306f4cd87bb566ff9884f875fff2dd2ba2d1`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34801911635`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.39_PROGRESS.md`
4. `docs/PLAYTEST_0.1.39.md`
5. `docs/MVP_0.1.38_PROGRESS.md`
6. `src/scenes/CareerMinigameBoardScene039.ts`
7. `src/scenes/CareerMinigameBoardScene037.ts`
8. `src/scenes/CareerMinigameBoardScene.ts`
9. `src/ui/MiniGameOverlay.ts`
10. `tests/final-result-transition-039.ts`
11. `tests/choice-sfx-038.ts`
12. `tests/minigame-authority-037.ts`

## 0.1.39 final result clarity

- The authoritative result overlay is still the only source of winner/ranking truth.
- PresentationParity continues to defer result rendering while presentation is blocking.
- Pending Mini Game payout must resolve before the match may finalize.
- Once the real result overlay is eligible, 0.1.39 briefly shows `4/4 HOÀN THÀNH` and `KHÓA BẢNG B$ • CHỐT THỨ HẠNG`.
- Result buttons are input-blocked during the short reveal beat.
- The existing authoritative result overlay then fades in.
- Transition uses fixed presentation positions only, submits no gameplay command, mutates no wallet/ranking state and adds no RNG.
- Victory SFX remains owned by the existing real-result hook and is not duplicated.

## Retained 0.1.38 choice polish

- Choice SFX covers Route/Branch, Card, Target, Tactical Choice, Setup and Settings confirmations.
- Existing choice feedback remains on Lobby, Job Dice, Mini Game human choices and Enter Match.
- Dice actions keep the dedicated dice cue.
- Lobby/Setup show the current build and no obsolete `demo 3 vòng` copy.

## Retained Mini Game authority/audio rules

- Mini Game payout is host-system owned and applies once per source event.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM is exactly checksum-locked `03_City_Silly.ogg`.
- Eight event SFX remain: victory, news, card, step, money loss, money gain, dice, choice.
- Four approved BGM files must not be re-encoded or substituted.

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

1. Finish a match and verify final movement/reaction/Mini Game presentation clears before the 4/4 B$ lock banner.
2. Confirm result buttons cannot be clicked during the short lock banner.
3. Confirm ranking and B$ are identical before/after the transition.
4. Rematch and confirm the transition can occur once again in the new match.
5. Re-test P1 movement + Card/News for no snap-back.
6. Re-test Job Hub token reconcile.
7. Re-check Mini Game payout once-only, eight SFX, choice coverage and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.39_PROGRESS.md và docs/PLAYTEST_0.1.39.md. Current validated artifact là mememe-playtest-0.1.39, run #1139, runtime SHA 86764fa9aeda89067cb1abd29703985f5c993c04. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
