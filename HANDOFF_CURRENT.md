# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.33 — Stable Token Sync + One-Lap Scoring**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34772171455` / run `#938`

Validated runtime head SHA:
`12bd0180e37a6eca39d4b1ff63cfac407281dfb6`

Artifact:
`mememe-playtest-0.1.33`

Artifact ID:
`10322258905`

Artifact size:
`8,518,927 bytes`

Digest:
`sha256:b5d9c0c5118756528e6573d71f97c2a795ffd6938c8d45789d7a5ad6b0a6a5af`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34772171455`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.33_PROGRESS.md`
4. `docs/PLAYTEST_0.1.33.md`
5. `docs/MVP_0.1.32_PROGRESS.md`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/scenes/PresentationParityBoardScene.ts`
8. `src/core/demoMatch.ts`
9. `src/core/replay.ts`
10. `src/core/matchState.ts`
11. `src/core/checksum.ts`
12. `src/core/types.ts`
13. `tests/demo-match-shell.ts`
14. `tests/replay-determinism.ts`
15. `tests/authority-protocol.ts`

## Runtime feedback fixed in 0.1.33

### Token snap-back / fly-forward bug

Observed behavior was visual only: P1 could already reach the correct node, then Card/News/state presentation briefly showed P1 at an older node before flying back to the correct destination.

Fix:
- normal state packets no longer own token coordinates;
- normal movement coordinates are controlled only by queued `move_step` presentation;
- state updates therefore cannot kill/snap an in-flight movement tween;
- snapshot resync and rematch command #0 retain hard-snap authority;
- stale movement events are prevented from replaying over snapshot correction.

Authoritative player `nodeId`, movement path, dice, Card effects and RNG rules are unchanged.

### One full lap before scoring

The old fixed `3 rounds / 12 turns` end rule is no longer active.

Current playtest rule:
1. each player starts with `lapsCompleted = 0`;
2. crossing Ready/start increments that player's lap count;
3. game continues until **all players have completed at least one full board lap**;
4. only then is the B$ leaderboard finalized;
5. highest B$ wins; tied B$ is a shared win.

`lapsCompleted` is authoritative, replay-safe and checksum-covered.

The old shell `rounds` / `turnLimit` fields remain only for compatibility and do not end the match.

### HUD / presentation

- compact HUD shows `HOÀN THÀNH 1 VÒNG • X/4`;
- waiting/result text explains the one-lap finish condition;
- build label identifies 0.1.33 one-lap scoring/token sync.

## Existing gameplay retained

- Roll For Order before match; higher D6 acts first, tied group rerolls only;
- mandatory Job Hub stop;
- 3 unique Job offers A/B/C;
- authoritative Job D6: `1–2 → A`, `3–4 → B`, `5–6 → C`;
- no direct Job-card selection;
- starting wallet `200 B$`;
- crossing Ready pays current Job salary; unemployed gets `0 B$` salary but still completes the lap;
- promotion / steady / demotion / fired and Thief `jailed` state retained;
- Mini Game `Nhiều ra ít bị`, switching to RPS at 1v1;
- direct clickable dice;
- node-by-node movement;
- automatic parity route logic;
- Tactical Choice / Kèo Hai Cửa;
- rare deterministic CPU `bấm trượt tay` quirk;
- side reaction chat remains left/right;
- Settings BGM / volume / FX;
- approved BGM remains checksum-locked and must not be re-encoded/substituted.

Do **not** invent jail skipped-turn/bail/escape rules or Mini Game B$ payout until Bửu Bối explicitly defines them.

## Determinism / networking invariants

- no presentation RNG may perturb gameplay RNG;
- `eventLog` remains presentation-only and checksum-excluded;
- `playOrder`, Job state/pending offers and `lapsCompleted` are checksum-covered;
- replay determinism, lockstep, authority, host/client resync and two-tab tests are green;
- snapshot resync must not replay stale presentation;
- result/ranking waits until final presentation clears;
- dice presentation must show authoritative results;
- original face files remain local and are not silently uploaded/persisted;
- CPU remains a QA bot, not final gameplay AI.

## Full CI state

Run #938 passed through artifact upload:
- build/typecheck;
- deterministic replay;
- lockstep;
- host/client queue + snapshot resync;
- authority protocol;
- two-tab core;
- one-lap demo shell + rematch;
- CPU autoplay;
- presentation / flow / board regressions;
- Settings/audio;
- content/reaction/party/economy/stakes/tactical;
- function tiles;
- direct dice;
- Job Dice / Salary / Roll For Order / Mini Games;
- package validation;
- 0.1.33 guide copy;
- artifact upload.

## Recommended next step

Runtime-test `mememe-playtest-0.1.33`.

Priority checks:
1. P1 must never visually snap back after finishing movement, including when Card/News opens;
2. snapshot/rematch must still restore correct authoritative token location;
3. lap HUD increments only when passing Ready;
4. match must continue past old 12-turn boundary if somebody has not completed a lap;
5. final B$ score appears only after the final unfinished player completes lap 1;
6. salary and lap count happen together exactly once per Ready crossing.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.33_PROGRESS.md và docs/PLAYTEST_0.1.33.md. Current validated artifact là mememe-playtest-0.1.33, run #938, runtime SHA 12bd0180e37a6eca39d4b1ff63cfac407281dfb6. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
