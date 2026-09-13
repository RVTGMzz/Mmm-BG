# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.34 — One-Lap Clarity + Ready Celebration**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34772895816` / run `#956`

Validated runtime head SHA:
`f6431f8523bdb10cd438e84ca103a7a7d449009d`

Artifact:
`mememe-playtest-0.1.34`

Artifact ID:
`10321679066`

Artifact size:
`8,518,701 bytes`

Digest:
`sha256:3aa3513b6ea14757026b520340aa52cca46f16b7886830a2956a52d4accd1f29`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34772895816`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.34_PROGRESS.md`
4. `docs/PLAYTEST_0.1.34.md`
5. `docs/MVP_0.1.33_PROGRESS.md`
6. `docs/PLAYTEST_0.1.33.md`
7. `src/scenes/CareerMinigameBoardScene.ts`
8. `src/scenes/TurnStakesBoardScene.ts`
9. `src/scenes/PresentationParityBoardScene.ts`
10. `src/core/demoMatch.ts`
11. `src/core/replay.ts`
12. `src/core/matchState.ts`
13. `src/core/checksum.ts`
14. `src/core/types.ts`
15. `tests/demo-match-shell.ts`
16. `tests/replay-determinism.ts`

## 0.1.34 polish

### Lap-native HUD / leaderboard
- Compact HUD reads authoritative lap progress directly: `HOÀN THÀNH 1 VÒNG • X/4`.
- No active board-first HUD logic needs to derive old `Vòng 1/3`, `2/3`, `3/3` progress anymore.
- Every B$ leaderboard row shows lap state:
  - `🏁0/1` before the required lap is complete;
  - `🏁✓` after the player completes lap 1.
- Money ranking still depends only on B$, not lap status.

### READY completion banner
- First required READY crossing shows `🏁 <PLAYER> HOÀN THÀNH 1 VÒNG!`.
- Detail line shows table progress such as `2/4 người đã đủ vòng`.
- Banner is presentation-only and does not perturb gameplay RNG or checksum.
- Snapshot/resync does not replay already-consumed lap completion feedback.

### Build label
- Current scene recognizes inherited 0.1.30 / 0.1.31 / 0.1.33 labels and promotes them to the visible 0.1.34 badge.

## 0.1.33 fixes retained

### Token snap-back / fly-forward
- Normal host/state packets do not own token coordinates during normal play.
- Queued `move_step` presentation owns visual movement.
- Card/News/state updates must not snap P1 back to an older node.
- Snapshot resync and rematch command #0 retain hard-snap authority.

### One full lap before scoring
Current playtest rule:
1. every player starts with `lapsCompleted = 0`;
2. crossing Ready/start increments that player's lap count;
3. game continues until **all players have completed at least one full board lap**;
4. only then is the B$ leaderboard finalized;
5. highest B$ wins; tied B$ remains shared win.

`lapsCompleted` remains authoritative, replay-safe and checksum-covered.

The old shell `rounds` / `turnLimit` fields remain for compatibility only and do not end the match.

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

Run #956 passed through artifact upload:
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
- 0.1.34 guide copy;
- artifact upload.

## Recommended next step

Runtime-test `mememe-playtest-0.1.34`.

Priority checks:
1. B$ rows change from `🏁0/1` to `🏁✓` exactly when each player first crosses Ready;
2. lap-complete banner appears once and does not block flow;
3. snapshot/resync does not replay the banner;
4. P1 still never snaps backward after movement + Card/News;
5. final B$ score waits for the last unfinished player to complete lap 1;
6. salary and lap count happen together exactly once per Ready crossing.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.34_PROGRESS.md và docs/PLAYTEST_0.1.34.md. Current validated artifact là mememe-playtest-0.1.34, run #956, runtime SHA f6431f8523bdb10cd438e84ca103a7a7d449009d. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
