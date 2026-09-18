# MeMeMe MVP 0.1.35 — Job Token Reconcile + RPS Duel

Status: ACTIVE / CODE GREEN SO FAR / PAYOUT VALUES REQUIRED BEFORE FINAL PACKAGE

## Runtime feedback addressed

### 1. Human token can remain one node behind at Job Hub

Observed after the 0.1.33 token-sync fix:
- Player 1 can physically reach the Job Hub in authoritative state;
- the human token can remain visually at the previous node while JOB_CHOICE is open;
- it only appears correct again on a later turn.

0.1.35 adds a safe Job-Hub-only reconciliation for the controlled human player:
- it runs only after movement presentation has finished and control is available;
- it reads the authoritative `player.nodeId`;
- it corrects only the visual token coordinate;
- it runs behind the Job picker backdrop and again immediately before the Job-dice intent;
- it does not alter movement state, dice, Job state or RNG.

The 0.1.33 rule remains: ordinary state packets must not interrupt an in-flight movement tween.

### 2. RPS final now has an actual duel animation

When the Mini Game reaches exactly two players:
- both finalists are shown opposite each other;
- the screen performs an `OẲN... TÙ... XÌ!` rhythm;
- hand icons animate before revealing the authoritative/local Mini Game choices;
- the winner card receives a highlight;
- ties animate and repeat;
- CPU vs CPU still plays the full duel instead of silently resolving.

The animation is deterministic presentation and does not consume gameplay RNG.

### 3. Mini Game ranking is now tracked visually

The overlay now records elimination order and builds a final ranking:
- winner of RPS = rank 1;
- RPS loser = rank 2;
- earlier `Nhiều ra ít bị` eliminations fill rank 3 / rank 4 in reverse elimination order;
- the result overlay displays the podium/order.

This ranking groundwork is intentionally not applying B$ yet.

## Payout still needs one exact rule from Ron

Ron has now defined the payout structure:
- rank 1 gets B$;
- rank 2 gets B$;
- rank 3 gets B$;
- last place gets 0 B$.

Before making this gameplay-critical and checksum/replay-safe, exact values are still required for rank 1 / 2 / 3.

Do not invent these amounts. Once specified, implement the Mini Game payout authoritatively rather than mutating money only from presentation/UI.

## Retained invariants

- all four players must complete one lap before final match scoring;
- approved BGM must not be re-encoded/substituted;
- presentation RNG must not perturb gameplay RNG;
- snapshot resync must not replay stale presentation;
- result/ranking waits until presentation clears;
- jail skip/bail/escape rules remain undefined;
- PR #1 must not be merged unless Ron explicitly asks.
