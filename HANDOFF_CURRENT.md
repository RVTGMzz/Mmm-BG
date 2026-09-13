# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.32 — Runtime Clarity Polish**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34771327955` / run `#906`

Validated runtime head SHA:
`cc384e5027037bdce2427632038ff70065732d75`

Artifact:
`mememe-playtest-0.1.32`

Artifact ID:
`10322073071`

Artifact size:
`8,517,792 bytes`

Digest:
`sha256:8ca6e5793f96faa6320777859ae02de1ad6bfa9f9265405991ee754e46f4f186`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34771327955`

Golden deterministic replay checksum for seed `123456789`, 20 turns:
`9cb73072`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.32_PROGRESS.md`
4. `docs/PLAYTEST_0.1.32.md`
5. `docs/MVP_0.1.31_PROGRESS.md`
6. `docs/PLAYTEST_0.1.31.md`
7. `src/scenes/TurnOrderScene.ts`
8. `src/scenes/CareerMinigameBoardScene.ts`
9. `src/ui/JobChoicePicker.ts`
10. `src/ui/MiniGameOverlay.ts`
11. `src/core/jobs.ts`
12. `src/content/core/jobs_mvp.json`
13. `src/core/matchState.ts`
14. `src/core/replay.ts`
15. `src/core/authority.ts`
16. `src/core/checksum.ts`
17. `tests/job-minigame-031.ts`

## 0.1.32 runtime-feedback polish

### Roll For Order
- Final player cards now show `THỨ 1 / THỨ 2 / THỨ 3 / THỨ 4` after order resolution.
- Rank stays attached to the same player identity, face, color and ownership.
- Final `VÀO TRẬN` uses UI-confirm SFX rather than another dice-roll SFX.
- Existing authoritative order/tie behavior is unchanged.

### Job Hub
- Three offers are visibly labeled `A / B / C`.
- Overlay repeats `1–2 → A`, `3–4 → B`, `5–6 → C` directly above the Job roll button.
- Copy explicitly tells the player that the die decides the Job and the cards are not direct-selection buttons.
- Job roll button disables immediately after accepted input to guard against duplicate pointer submission.
- Job probability, salary, career progression and gameplay RNG are unchanged.

### Playtest package
- Packaged `PLAYTEST.txt` is refreshed from stale 0.1.16.2 text to current controls/features/known limitations.
- Artifact now includes `docs/PLAYTEST_0.1.32.md` as `PLAYTEST_GUIDE.md`.

## Gameplay rules retained from 0.1.31

### Roll For Order
Before the board match starts, all 4 players roll D6.
- higher roll acts earlier;
- only tied players reroll;
- only authoritative `playOrder` changes;
- `playOrder` is checksum-covered and replay/snapshot-safe.

Current local 2-tab limitation remains: host/local setup performs order rolls rather than collecting one remote click per browser.

### Mandatory Job Hub
Job Hub remains a mandatory stop at the merge after the route split.

If unemployed:
1. draw 3 unique random Jobs;
2. show A / B / C;
3. roll one authoritative Job D6;
4. `1–2 → A`, `3–4 → B`, `5–6 → C`;
5. no direct Job-card selection.

### Job economy / progression
- starting wallet: `200 B$`;
- salary paid when passing Ready/start based on current Job + level;
- no active Job gives `0 B$` salary;
- later Job Hub visits can promote / steady / demote / fire;
- Thief can enter `jailed`.

Do **not** invent jail skipped-turn/bail/escape rules yet.

### Mini Games
- `Nhiều ra ít bị`: minority is eliminated, ties replay, repeat until two remain;
- at 1v1 automatically switch to Oẳn Tù Xì;
- RPS ties replay until a winner exists.

Do **not** invent Mini Game B$ payout yet.

## Other gameplay retained

- direct clickable dice on human turns;
- node-by-node movement;
- automatic parity route choice logic;
- Tactical Choice / Kèo Hai Cửa;
- rare deterministic CPU `bấm trượt tay` quirk;
- CPU/NPC reaction chat duration 2.5x;
- side reaction chat remains left/right and off-center;
- live B$ leaderboard / wallet deltas;
- Settings panel with BGM / volume / FX;
- approved BGM bundle checksum-locked, no re-encode/substitution;
- face original files remain local and are not silently uploaded/persisted.

## Determinism / networking invariants

- no presentation RNG may perturb gameplay RNG;
- `eventLog` remains presentation-only and checksum-excluded;
- Job state/pending offers and `playOrder` remain checksum-covered;
- snapshot resync must not replay stale presentation;
- result/ranking waits until final presentation clears;
- dice presentation must show authoritative results;
- CPU remains a QA bot, not final gameplay AI.

## Full CI state

Run #906 passed:
- build/typecheck;
- replay determinism;
- lockstep;
- host/client queue + snapshot resync;
- authority protocol;
- two-tab core;
- demo shell/rematch;
- CPU autoplay;
- presentation/flow/board regressions;
- Settings/audio;
- content/reaction/party/economy/stakes/tactical;
- function tiles;
- direct dice;
- Job Dice / Salary / Roll For Order / Mini Games regression;
- package validation;
- 0.1.32 guide copy;
- artifact upload.

## Recommended next step

Runtime-test `mememe-playtest-0.1.32` before expanding systems.

Focus:
1. final Roll For Order rank readability;
2. Job Hub A/B/C readability;
3. accidental double input on Job roll;
4. salary popup / Mini Game / direct dice / Settings/BGM / rematch smoke test;
5. remaining visual/flow feedback.

Only after exact rules are defined should work continue on jail gameplay or Mini Game economy.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.32_PROGRESS.md và docs/PLAYTEST_0.1.32.md. Current validated artifact là mememe-playtest-0.1.32, run #906, runtime SHA cc384e5027037bdce2427632038ff70065732d75. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
