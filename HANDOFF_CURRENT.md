# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1

Source of truth: `docs/LATEST_HANDOFF.md`

## Current milestone

**MVP 0.1.31 — Job Dice, Salary, Mini Games & Roll For Order**

Status: **ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN**

Do not merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated playable build

GitHub Actions run: `34770525811` / run `#889`

Validated runtime head SHA:
`b13ac17af79368702af851ca8130af807407124e`

Artifact:
`mememe-playtest-0.1.31`

Artifact ID:
`10321787667`

Digest:
`sha256:7dde2394425bfe7ce79f92a86f6b9213a6de46207b786d9f7db6a6957194cbf0`

Run URL:
`https://github.com/ronvotri/MeMeMe-BoardGame/actions/runs/34770525811`

Golden deterministic replay checksum for seed `123456789`, 20 turns:
`9cb73072`

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.31_PROGRESS.md`
4. `docs/PLAYTEST_0.1.31.md`
5. `src/scenes/TurnOrderScene.ts`
6. `src/scenes/CareerMinigameBoardScene.ts`
7. `src/ui/JobChoicePicker.ts`
8. `src/ui/MiniGameOverlay.ts`
9. `src/core/jobs.ts`
10. `src/content/core/jobs_mvp.json`
11. `src/core/matchState.ts`
12. `src/core/replay.ts`
13. `src/core/authority.ts`
14. `src/core/checksum.ts`
15. `tests/job-minigame-031.ts`

## Rules locked in 0.1.31

### Roll For Order

Before the board match starts, all 4 players roll D6 to determine play order.

- higher roll acts earlier;
- only tied players reroll until their relative order is resolved;
- player IDs, face assets, colors and CPU/human ownership stay attached to the same player;
- only authoritative `playOrder` changes;
- `playOrder` is checksum-covered and replay/snapshot-safe.

Current local 2-tab limitation: the host/local setup ceremony performs the order rolls rather than collecting an individual click from every remote browser. The resulting order is still authoritative.

### Mandatory Job Hub

Job Hub is a mandatory stop at the merge after the route split.

A token stops there even with unused movement steps.

If the player currently has no active Job:

1. draw 3 unique random Jobs from the 10-Job pool;
2. show them as A / B / C;
3. player rolls an authoritative Job D6;
4. `1–2 → A`, `3–4 → B`, `5–6 → C`;
5. no click-selection of the Job card.

The Job D6 result is authoritative and presentation must display that exact result.

### Job economy

Every Job has:
- salary at Lv.1 / Lv.2 / Lv.3;
- promotion / demotion probabilities;
- small identity/trait text;
- optional Job-specific risk.

Salary is paid when passing the Ready/start gate.

The previous flat `READY +100 B$` reward is removed.

- employed player → receives salary from current Job + level;
- unemployed / no active Job → receives `0 B$` salary.

All provisional salary curves and career probabilities live in:
`src/content/core/jobs_mvp.json`

Treat them as first-pass balancing data, not sacred final numbers.

### Career progression

On later Job Hub visits while employed:
- promotion;
- steady;
- demotion;
- normal careers can be fired after a bad demotion;
- Thief can become `jailed`.

Do **not** invent detailed jail gameplay yet. Ron has not yet fixed skipped turns, bail, escape, etc.

### Mini Games

Current playable rules:

**Nhiều ra ít bị**
- starts with 3–4 active players;
- each chooses SẤP / NGỬA;
- minority side is eliminated;
- tie means replay with nobody eliminated;
- survivors repeat until exactly 2 remain.

**Oẳn Tù Xì**
- when active Mini Game participants reach 1v1, mode automatically changes to Rock/Paper/Scissors;
- ties replay until a winner exists.

Do **not** invent B$ reward/penalty yet. Mini Game economy remains intentionally neutral until Ron defines it.

## Other gameplay retained

- starting wallet: `200 B$`;
- direct clickable dice on human turns;
- old bottom `ĐỔ XÚC XẮC` control removed from active UI;
- node-by-node movement;
- automatic parity route choice logic retained;
- Tactical Choice / Kèo Hai Cửa;
- rare deterministic CPU "bấm trượt tay" quirk;
- CPU/NPC reaction chat duration is 2.5x;
- live B$ leaderboard / wallet deltas;
- Settings panel with BGM / volume / FX;
- approved BGM bundle remains checksum-locked and must not be re-encoded;
- face original files remain local and are not silently uploaded/persisted.

## Determinism / networking invariants

- no presentation RNG may perturb gameplay RNG;
- `eventLog` remains presentation-only and checksum-excluded;
- Job state and pending Job offers are gameplay-critical and checksum-covered;
- `playOrder` is gameplay-critical and checksum-covered;
- snapshot resync must not replay stale presentation;
- result/ranking must wait until final presentation clears;
- CPU remains a QA bot, not final gameplay AI.

## Full CI state

Run #889 passed:
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
- dedicated `Job Dice salary Roll For Order and Mini Games` regression;
- package validation;
- artifact upload.

## Recommended next step

Prefer **runtime playtest feedback on 0.1.31** before expanding systems.

After feedback, likely work:
1. fix any visual/flow bugs from Roll For Order, Job Dice, Mini Games or salary popup;
2. tune salary/probability data if economy feels too fast/slow;
3. only implement jail mechanics after Ron defines the exact rule;
4. only add Mini Game B$ reward/penalty after Ron defines it;
5. deepen individual Job special traits after the basic salary/progression loop feels good.

## New-chat resume prompt

Copy/paste this into a new chat:

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. Đọc docs/LATEST_HANDOFF.md, docs/MVP_0.1.31_PROGRESS.md và docs/PLAYTEST_0.1.31.md. Current validated artifact là mememe-playtest-0.1.31, run #889, runtime SHA b13ac17af79368702af851ca8130af807407124e. Tiếp tục từ runtime feedback/build tiếp, không merge PR #1.`
