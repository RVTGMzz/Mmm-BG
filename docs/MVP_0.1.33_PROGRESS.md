# MeMeMe MVP 0.1.33 — Stable Token Sync + One-Lap Scoring

Status: ACTIVE / PLAYTEST PACKAGED / FULL CI GREEN

## Runtime feedback addressed

### 1. Token occasionally snaps backward before Card/News presentation

Observed symptom:
- human player finishes movement at the correct destination;
- before the next presentation/turn, a later Card/News/state update can briefly show the token at an earlier node;
- the token then flies back to the already-correct destination;
- authoritative gameplay position itself never actually changed.

Root cause:
- authoritative state sync and movement presentation both had permission to write token coordinates;
- a non-movement state packet could run `syncVisualsToState()` while a move-step presentation was still active or after visual movement had already committed;
- that state sync could kill/snap the tween even though gameplay state was valid.

0.1.33 fix:
- normal host/state messages no longer write token coordinates;
- token movement is presentation-owned and only `move_step` events move tokens during normal play;
- snapshot resync and rematch command #0 retain hard-snap authority;
- snapshot hard-snap advances the visual event cursor so stale `move_step` events cannot replay over the resync.

This is a visual ownership fix only. It does not alter dice results, movement path, node state, RNG, Card effects or turn order.

### 2. Match scoring now waits for one physical board lap

Current playtest rule:

**Do not score by fixed turn/round count.**

Instead:
1. each player starts with `lapsCompleted = 0`;
2. crossing the Ready/start node increments that player's `lapsCompleted`;
3. the match stays active until **every player has completed at least one full board lap**;
4. only then is the B$ leaderboard finalized and the highest B$ score wins;
5. tied B$ remains a shared win.

`lapsCompleted` is gameplay-critical and checksum-covered.

The old demo-shell `rounds` / `turnLimit` fields remain serialized for backward compatibility, but they no longer decide match end.

## UI changes

- compact turn HUD now shows `HOÀN THÀNH 1 VÒNG • X/4`;
- waiting/result copy explains that all four players must cross Ready once before scoring;
- build label advances to `MVP 0.1.33 • 1 LAP THEN SCORE`.

## Determinism / regression changes

- old pre-lap hardcoded replay/authority checksum expectations were removed because `lapsCompleted` intentionally changes gameplay-critical checksum payload;
- replay still proves identical command streams resolve identically;
- explicit regression proves changing a player's completed-lap count changes checksum;
- authority, lockstep, host/client resync and two-tab tests all remain green;
- one-lap demo-shell regression proves the match stays alive past the old fixed turn boundary and ends only when all players finish one lap;
- rematch regression proves lap counters reset to zero.

## Invariants retained

- starting wallet stays `200 B$`;
- salary still pays when passing Ready based on Job + level;
- no active Job still pays `0 B$` salary;
- Job Hub remains mandatory;
- Mini Game payout remains neutral until explicitly defined;
- jail deep rules remain undefined;
- presentation RNG must not perturb gameplay RNG;
- eventLog remains presentation-only and checksum-excluded;
- snapshot resync must not replay stale presentation;
- approved BGM remains checksum-locked;
- CPU remains a QA bot;
- do not merge PR #1 without explicit instruction.

## Validated artifact

GitHub Actions run:

`34772171455` / run `#938`

Validated runtime head SHA:

`12bd0180e37a6eca39d4b1ff63cfac407281dfb6`

Artifact:

`mememe-playtest-0.1.33`

Artifact ID:

`10322258905`

Size:

`8,518,927 bytes`

Digest:

`sha256:b5d9c0c5118756528e6573d71f97c2a795ffd6938c8d45789d7a5ad6b0a6a5af`

Full CI passed through artifact upload, including build/typecheck, deterministic replay, lockstep, authority/resync, two-tab core, one-lap demo shell/rematch, CPU autoplay, presentation/board regressions, Settings/audio, economy/tactical/function-tile/direct-dice/Job-MiniGame regressions, package validation and 0.1.33 playtest guide.

## Runtime playtest focus

1. Move P1 several nodes and trigger Card/News presentation. Confirm the token never snaps backward.
2. Confirm normal state updates do not interrupt an in-flight move-step tween.
3. Confirm snapshot/rematch still snap tokens to authoritative nodes.
4. Confirm crossing Ready increments lap count exactly once.
5. Confirm the match does NOT end at the old 12-turn / 3-round boundary.
6. Confirm scoring appears only when all four players have completed one lap.
7. Confirm rematch resets all lap counters to zero.
