# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.32 — Runtime Clarity Polish (ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN)**

Latest validated artifact: `mememe-playtest-0.1.32`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.32_PROGRESS.md`
3. `docs/PLAYTEST_0.1.32.md`
4. `docs/MVP_0.1.31_PROGRESS.md`
5. `docs/PLAYTEST_0.1.31.md`
6. `src/scenes/TurnOrderScene.ts`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/ui/JobChoicePicker.ts`
9. `src/ui/MiniGameOverlay.ts`
10. `src/core/jobs.ts`
11. `src/content/core/jobs_mvp.json`
12. `src/core/matchState.ts`
13. `src/core/checksum.ts`
14. `src/core/replay.ts`
15. `src/core/authority.ts`
16. `tests/job-minigame-031.ts`

## What changed in 0.1.32

### Roll For Order clarity
- Final player cards now show `THỨ 1 / THỨ 2 / THỨ 3 / THỨ 4` after order resolution.
- Rank stays attached to the existing player identity; IDs/faces/colors/CPU ownership do not move.
- `VÀO TRẬN` now plays normal UI-confirm SFX rather than a second dice-roll sound.
- Tie behavior and authoritative `playOrder` are unchanged.

### Job Hub clarity
- The three random Jobs are visibly labeled `A / B / C`.
- The D6 mapping is repeated in the overlay: `1–2 → A`, `3–4 → B`, `5–6 → C`.
- Copy explicitly says the die decides the Job and cards cannot be directly selected.
- Job roll input disables immediately after acceptance to avoid duplicate presentation input.
- Job assignment, salary curves, progression odds and gameplay RNG are unchanged.

### External playtest package
- `PLAYTEST.txt` is refreshed from its stale 0.1.16.2 wording to current 0.1.32 controls and known limitations.
- CI now copies `docs/PLAYTEST_0.1.32.md` into the artifact.

## Retained 0.1.31 gameplay rules

### Roll For Order
- Four players roll D6 before the board match.
- Higher roll acts earlier.
- Only tied players reroll until relative order resolves.
- Stable player identity remains fixed; only `playOrder` changes.
- `playOrder` remains checksum-covered and replay/snapshot-safe.

### Mandatory Job Hub
- Job Hub remains a mandatory stop at the branch merge.
- If unemployed, draw exactly three unique Jobs.
- One authoritative Job D6 assigns A/B/C.
- No direct click-selection of Job cards.

### Job economy / career
- Starting wallet remains `200 B$`.
- Salary is paid when passing Ready/start based on current Job + level.
- No active Job means `0 B$` salary.
- Later Job Hub visits can promote / steady / demote / fire; Thief may enter `jailed`.
- Do not invent detailed jail rules yet.

### Mini Games
- `Nhiều ra ít bị`: repeated SẤP/NGỬA elimination; ties replay.
- At exactly two players, switch to Oẳn Tù Xì.
- RPS ties replay until a winner exists.
- Do not invent B$ Mini Game rewards/penalties yet.

## Determinism / authority invariants

- Golden replay seed: `123456789`.
- 20-turn checksum remains `9cb73072`.
- Presentation RNG must not perturb gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- Job state/pending offers and `playOrder` remain gameplay-critical and checksum-covered.
- Snapshot resync must not replay stale presentation.
- Result/ranking waits for final presentation to clear.
- Dice presentation always displays the authoritative result.
- Approved BGM bundle remains checksum-locked and must not be re-encoded/substituted.
- Original face files remain local and must not be silently uploaded/persisted.
- CPU remains a QA bot, not final gameplay AI.

## Validated artifact

GitHub Actions run: `34771327955` / run `#906`

Validated runtime head SHA:
`cc384e5027037bdce2427632038ff70065732d75`

Artifact:
`mememe-playtest-0.1.32`

Artifact ID:
`10322073071`

Size:
`8,517,792 bytes`

Digest:
`sha256:8ca6e5793f96faa6320777859ae02de1ad6bfa9f9265405991ee754e46f4f186`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34771327955`

Full CI passed through artifact upload, including build/typecheck, deterministic replay, lockstep, host/client resync, authority, two-tab core, CPU autoplay, presentation/board regressions, Settings/audio, economy/tactical/function-tile/direct-dice/Job-MiniGame tests, package validation and 0.1.32 guide copy.

This handoff commit is documentation-only after the validated runtime head and does not require replacing the validated artifact by itself.

## Current runtime-test focus

1. Check whether final Roll For Order rank labels are readable and clearly attached to the correct player.
2. Check Job Hub A/B/C mapping at a glance on actual hardware.
3. Check Job D6 cannot be accidentally submitted twice.
4. Re-test salary popup, Mini Game, direct dice, Settings/BGM and rematch.
5. Report any remaining visual/flow friction before expanding gameplay systems.

## Deferred until exact rules are defined

- Jail skipped-turn / bail / escape mechanics.
- Mini Game B$ reward/penalty.
- Deeper Job-specific mechanical traits.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.32_PROGRESS.md và docs/PLAYTEST_0.1.32.md. Current validated artifact là mememe-playtest-0.1.32, run #906, runtime SHA cc384e5027037bdce2427632038ff70065732d75. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
