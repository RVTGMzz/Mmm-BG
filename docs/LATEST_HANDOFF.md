# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1

Root checkpoint for new chats: `HANDOFF_CURRENT.md`

## Current milestone

**MVP 0.1.31 — Job Dice, Salary, Mini Games & Roll For Order (ACTIVE / PLAYTEST PACKAGED)**

Latest artifact: `mememe-playtest-0.1.31`

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.31_PROGRESS.md`
3. `docs/PLAYTEST_0.1.31.md`
4. `src/scenes/TurnOrderScene.ts`
5. `src/scenes/CareerMinigameBoardScene.ts`
6. `src/ui/JobChoicePicker.ts`
7. `src/ui/MiniGameOverlay.ts`
8. `src/core/jobs.ts`
9. `src/content/core/jobs_mvp.json`
10. `src/core/matchState.ts`
11. `src/core/checksum.ts`
12. `src/core/replay.ts`
13. `src/core/authority.ts`
14. `tests/job-minigame-031.ts`
15. `tests/replay-determinism.ts`
16. `docs/MVP_0.1.30_PROGRESS.md`

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## 0.1.31 rules now locked

### Pregame Roll For Order
- After Setup, all four players roll a D6 before the match.
- Higher roll goes earlier.
- Only tied players reroll until their relative positions are resolved.
- Stable player ID, face, color and CPU/human ownership do not move; only `playOrder` changes.
- `playOrder` is gameplay-authoritative and checksum-covered.

### Mandatory Job Hub
- Job Hub is a mandatory stop at the branch merge.
- A token stops at Job Hub even if its movement die still has unused steps.
- First visit while unemployed draws exactly three unique Jobs from the ten-Job pool.
- The player does NOT click-select a Job.
- One authoritative Job D6 assigns the career:
  - 1–2 → Job A
  - 3–4 → Job B
  - 5–6 → Job C
- `job_dice_roll` is shown through the existing authoritative die presentation.

### Salary economy
- Every Job has a Lv.1 / Lv.2 / Lv.3 salary curve plus a small identity/trait.
- Salary is paid when passing the Ready/start gate.
- The old flat `READY +100 B$` reward is replaced by current Job salary.
- No active Job means `0 B$` salary.
- Career state (`jobId`, `jobLevel`, `jobStatus`) and pending Job offers are checksum-covered.

Current provisional salary curves live only in `src/content/core/jobs_mvp.json` so balancing does not require core-engine edits.

### Career progression
On later Job Hub visits while employed, the current Job can:
- promote;
- stay steady;
- demote;
- normal careers may be fired after a bad demotion;
- Thief can enter `jailed` status.

Deep jail rules such as skipped turns, bail and escape are intentionally deferred until Ron defines them.

### Mini Games
Playable Mini Game foundation currently includes:
- `Nhiều ra ít bị`: repeated SẤP/NGỬA elimination rounds;
- ties replay with no elimination;
- survivors continue until exactly two remain;
- 1v1 automatically switches to Oẳn Tù Xì;
- RPS ties replay until a winner exists.

Mini Game B$ payout/reward remains intentionally neutral because Ron has not defined it yet.

## Determinism / authority notes

- Golden replay seed: `123456789`
- 20-turn checksum: `9cb73072`
- Job assignment consumes one authoritative gameplay D6 after the three offer draws.
- `eventLog` remains presentation-only and checksum-excluded.
- Presentation RNG does not perturb gameplay RNG.
- Host/client replay preserves `playOrder`.
- CPU QA bot rolls Job dice through the same authoritative intent path.

## Validated artifact

GitHub Actions run: `34770525811` / run `#889`

Validated runtime head SHA: `b13ac17af79368702af851ca8130af807407124e`

Artifact: `mememe-playtest-0.1.31`

Artifact ID: `10321787667`

Size: `8,516,608 bytes`

Digest: `sha256:7dde2394425bfe7ce79f92a86f6b9213a6de46207b786d9f7db6a6957194cbf0`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34770525811`

Full CI passed through artifact upload, including:
- deterministic replay;
- lockstep;
- host/client snapshot resync;
- authority protocol;
- two-tab core;
- demo shell/rematch;
- CPU autoplay;
- presentation/flow/board regressions;
- economy/tactical/direct dice regressions;
- dedicated `Job Dice salary Roll For Order and Mini Games` regression;
- package validation and 0.1.31 guide copy.

This handoff commit is documentation-only after the validated artifact head and does not require rebuilding by itself.

## Important current limitation

For the current local 2-tab prototype, Roll For Order is performed from the host/local setup ceremony rather than collecting a separate die press from each remote browser. The resulting `playOrder` is still authoritative and travels through snapshots/replay.

## Next work candidates

Prefer runtime playtest feedback before adding more systems.

Likely next targets after 0.1.31 feedback:
- tune Job salaries/probabilities based on match pacing;
- define actual jail gameplay only after Ron specifies the rule;
- define Mini Game reward/penalty only after Ron specifies its economy;
- expand Job-specific special traits from light identity into deeper mechanics if desired;
- improve Job Hub / Roll For Order visual feel without changing authority rules.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.31_PROGRESS.md và docs/PLAYTEST_0.1.31.md. Current validated artifact là mememe-playtest-0.1.31, run #889, runtime SHA b13ac17af79368702af851ca8130af807407124e. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`

## Hard invariants

- Do not merge PR #1 or mark Ready unless Ron explicitly asks.
- Do not substitute or re-encode approved BGM.
- Do not add presentation RNG calls that perturb gameplay RNG.
- Do not invent jail or Mini Game payout rules without explicit confirmation.
- Presentation `eventLog` remains checksum-excluded.
- Snapshot resync must not replay stale presentation.
- Result/ranking must wait for final presentation to clear.
- Dice presentation must show the authoritative result.
- Original face files must not be silently uploaded or persisted.
- CPU remains a QA bot, not final gameplay AI.
