# MeMeMe MVP 0.1.33 — Stable Token Sync + One-Lap Scoring

Status: ACTIVE / VALIDATION IN PROGRESS

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
- that state sync could kill/snap the tween even though the gameplay state was valid.

0.1.33 fix:
- normal host/state messages no longer write token coordinates;
- token movement is presentation-owned and only `move_step` events move tokens during normal play;
- snapshot resync and rematch command #0 retain hard-snap authority;
- snapshot hard-snap first advances the visual event cursor so old `move_step` events cannot suppress the resync.

This is a visual ownership fix only. It does not alter dice results, movement path, node state, RNG, Card effects or turn order.

### 2. Match scoring now waits for one physical board lap

New playtest rule:

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

- compact turn HUD now shows `HOÀN THÀNH 1 VÒNG • X/4` rather than treating turn cycles as match rounds;
- waiting/result copy explains that all four players must cross Ready once before scoring;
- build label advances to `MVP 0.1.33 • 1 LAP THEN SCORE`.

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

## Validation focus

1. Move P1 several nodes and trigger Card/News presentation. Confirm the token never snaps backward.
2. Confirm normal state updates do not interrupt an in-flight move-step tween.
3. Confirm snapshot/rematch still snap tokens to authoritative nodes.
4. Confirm crossing Ready increments lap count exactly once.
5. Confirm the match does NOT end after the old fixed 12-turn / 3-round boundary.
6. Confirm scoring appears only when all four players have completed one lap.
7. Confirm rematch resets all lap counters to zero.
