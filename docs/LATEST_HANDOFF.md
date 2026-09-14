# MeMeMe - Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.44 - Result Controls Unlock After Podium (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.44`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.44_PROGRESS.md`
3. `docs/PLAYTEST_0.1.44.md`
4. `src/scenes/CareerMinigameBoardScene044.ts`
5. `src/scenes/CareerMinigameBoardScene043.ts`
6. `src/ui/podiumReveal.ts`
7. `src/scenes/CareerMinigameBoardScene042.ts`
8. `src/scenes/CareerMinigameBoardScene041.ts`
9. `tests/podium-result-gate-044.ts`
10. `tests/podium-reveal-043.ts`
11. `tests/podium-face-reaction-042.ts`
12. `tests/final-podium-041.ts`

## What changed in 0.1.44

0.1.44 adds a presentation-only input blocker that stays active through the tail of the 0.1.43 podium cascade. `CHƠI LẠI` / `VỀ LOBBY` cannot be activated until the final rank-1 reveal tween has finished plus a small fixed release pad.

The release time is calculated by `podiumRevealCompleteMs()` from fixed constants only. The blocker arms only for a real ended-state result overlay, sits above result controls and below the 0.1.39 lock blocker, and resets on rematch/non-ended state or shutdown.

No gameplay/system command, wallet mutation, result recomputation, winner mutation or randomness is added.

## Retained result chain

- 0.1.43 reveals podium displayed rank `4 → 3 → 2 → 1`; equal ranks share the exact same delay.
- 0.1.42 reaction faces and tied-winner spotlight remain intact.
- 0.1.41 authoritative B$/ranking and competition-rank display remain intact.
- 0.1.40 lap-native HUD/shell/log copy remains intact.
- PresentationParity still defers final result until queued presentation clears.
- Pending final Mini Game payout resolves before scoring.
- 0.1.39 still runs `4/4 HOÀN THÀNH` → `KHÓA BẢNG B$ • CHỐT THỨ HẠNG` first.
- Victory SFX remains one-shot.

## Retained gameplay/audio invariants

- Starting wallet `200 B$`.
- Every player completes one physical lap before final scoring.
- Crossing READY pays current Job salary exactly once and increments lap.
- Final Mini Game payout resolves before result.
- Mini Game payout is host-system owned and single-commit.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Mini Game BGM is checksum-locked `03_City_Silly.ogg`.
- Four approved BGM files must not be re-encoded/substituted.
- Eight supplied SFX remain checksum-verified.
- Roll For Order: highest D6 first; only tied seats reroll.
- Mandatory Job Hub uses Job D6 `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Normal state packets do not own token coordinates during queued movement presentation.
- Snapshot/rematch may hard-snap tokens; Job Hub reconciles the human token.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Original face files remain local.
- CPU remains a QA bot.
- Jail deep mechanics remain intentionally undefined.

## Validated artifact

GitHub Actions run: `34806052282` / run `#1303`

Validated runtime/package SHA:
`08fccea74a9399da289e86a057a0fce7be291292`

Artifact:
`mememe-playtest-0.1.44`

Artifact ID:
`10333470000`

Size:
`8,560,852 bytes`

Digest:
`sha256:8776e38b812576f83ad5ee78a50bf1601476a6bf9f22efb59aa4c92192cc7bb8`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34806052282`

Full CI passed through package validation and artifact upload, including the new result-control unlock regression.

## Runtime test focus

1. Spam result buttons during podium reveal and confirm they do nothing until the final winner beat finishes.
2. Confirm buttons work after the reveal completes.
3. Rematch and confirm the gate arms again.
4. Verify tied slots still reveal together.
5. Finish with a final Mini Game and verify payout commits before lock/podium.
6. Re-check P1 movement, Job token reconcile, all eight SFX and `03_City_Silly.ogg`.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.44_PROGRESS.md và docs/PLAYTEST_0.1.44.md. Current validated artifact là mememe-playtest-0.1.44, run #1303, runtime SHA 08fccea74a9399da289e86a057a0fce7be291292. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
