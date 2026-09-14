# MeMeMe - HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.37 - Mini Game Authority Cleanup**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34798951707` / run `#1073`

Validated runtime head SHA:
`be7dc3246a4ded76f3913cca5d61b9ee3f2f4acb`

Artifact:
`mememe-playtest-0.1.37`

Artifact ID:
`10330458664`

Artifact size:
`8,558,316 bytes`

Digest:
`sha256:da51a8277f3280ecc32954dabf0a1739327226874b2a181484cc864d5b5dd712`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34798951707`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.37_PROGRESS.md`
4. `docs/PLAYTEST_0.1.37.md`
5. `docs/MVP_0.1.36_PROGRESS.md`
6. `src/scenes/CareerMinigameBoardScene037.ts`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/ui/MiniGameOverlay.ts`
9. `src/core/twoTabSession.ts`
10. `src/core/authority.ts`
11. `tests/minigame-authority-037.ts`
12. `tests/job-minigame-031.ts`

## 0.1.37 fix

Mini Game reward ownership is now explicitly single-path:

- `MiniGameOverlay` produces the deterministic ranking;
- host commits payout only through `submitSystemIntent('resolve_minigame')`;
- the old redundant scene-level player/seat submission is suppressed;
- player/local `resolve_minigame` remains rejected by design;
- same Mini Game source event cannot pay twice.

New regression test `tests/minigame-authority-037.ts` locks this behavior and passed in full CI.

## 0.1.36 features retained

- 8 event SFX: victory, news, card, step, money loss, money gain, dice, choice.
- Roll For Order shows each player's D6; CPU seats also animate; tied seats reroll only.
- Mini Game BGM is approved `03_City_Silly.ogg`.
- No `track 1.MP3` and no fifth BGM.
- Four approved BGM assets remain checksum-locked and must not be re-encoded/substituted.
- Nhiều ra ít bị payout: `30 / 20 / 10 / 0 B$`.
- Direct Oẳn Tù Xì payout: `25 / 15 / 5 / 0 B$`.
- Oẳn Tù Xì 1v1 animation still runs for CPU vs CPU.

## Movement / score rules retained

- Normal network state packets must not steal token coordinates from queued movement presentation.
- Snapshot/rematch may hard-snap tokens to authoritative nodes.
- Job Hub explicitly reconciles the human token so it does not stay visually one node behind.
- Every player must complete at least one physical lap before final scoring.
- Old 3-round / 12-turn metadata does not end the match.
- If the last required lap ends on a Mini Game, final result waits until payout is committed.
- Crossing READY increments lap and pays current Job salary exactly once.

## Core rules retained

- Starting wallet `200 B$`.
- Mandatory Job Hub with three unique A/B/C offers.
- Job D6: `1-2 -> A`, `3-4 -> B`, `5-6 -> C`.
- Career promotion / steady / demotion / fired retained.
- Thief `jailed` status exists, but skipped-turn / bail / escape rules remain undefined. Do not invent them.
- CPU remains a QA bot.

## Determinism / networking invariants

- presentation RNG must not perturb gameplay RNG;
- `eventLog` remains presentation-only and checksum-excluded;
- gameplay-critical wallet, lap, playOrder and Job state remain authoritative/checksum-safe;
- snapshot resync must not replay stale presentation;
- result/ranking waits for final presentation and pending Mini Game economy;
- dice presentation must show authoritative results;
- original face files remain local and must not be silently uploaded/persisted.

## Full CI state

Run #1073 passed:
- build/typecheck;
- deterministic replay;
- lockstep;
- host/client queue + snapshot resync;
- authority protocol;
- two-tab core;
- demo shell + rematch;
- CPU autoplay;
- presentation / flow / board checks;
- Settings/audio;
- content/reaction/party/economy/stakes/tactical;
- function tiles;
- direct dice;
- Job Dice / Salary / Roll For Order / Mini Game payout;
- Mini Game host-system ownership regression;
- package validation;
- 0.1.37 guide copy;
- artifact upload.

## Recommended next runtime checks

1. Mini Game B$ changes exactly once.
2. HOST + JOIN with a joined seat entering Mini Game still receives host-authoritative payout state.
3. No second money jump or rejected payout noise after overlay closes.
4. P1 movement + Card/News still has no snap-back.
5. Job Hub still leaves the human token on the correct node.
6. Final score waits for pending Mini Game payout when applicable.
7. All eight SFX and `03_City_Silly.ogg` still trigger in the correct contexts.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.37_PROGRESS.md và docs/PLAYTEST_0.1.37.md. Current validated artifact là mememe-playtest-0.1.37, run #1073, runtime SHA be7dc3246a4ded76f3913cca5d61b9ee3f2f4acb. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
