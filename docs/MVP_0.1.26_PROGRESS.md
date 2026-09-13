# MeMeMe MVP 0.1.26 — Turn Stakes & Money Drama

Status: IN PROGRESS / CI PENDING

## Scope

0.1.26 is presentation-only. It does not change MatchState gameplay rules, economy values, RNG consumption, command types, Card probability, News probability or READY reward.

## Added

- `src/ui/moneyStakes.ts`
  - deterministic money ranking by B$ descending, seat ID ascending as tiebreak;
  - leader/trailer markers;
  - compact leaderboard row formatter;
  - exact wallet delta comparison between authoritative states.
- `src/scenes/TurnStakesBoardScene.ts`
  - active board wrapper over 0.1.25 gameplay;
  - live money leaderboard sorted by rank;
  - crown for current leader and lifebuoy for current trailer;
  - current-turn line includes wallet and rank;
  - non-blocking transient wallet delta labels;
  - subtle leaderboard pulse when the leader changes;
  - snapshot resync suppresses stale wallet FX.
- Lobby/Setup/Board build labels moved to 0.1.26.
- `tests/money-stakes-026.ts` locks deterministic ranking, markers and delta math.

## Retained

- 200 B$ starting wallet.
- 0.1.25 money tile / News / Phao scale.
- READY +100 B$.
- Party Mechanics from 0.1.24.
- Card/News/Reaction timing and queue rules.
- Node-by-node movement, graphical dice, route parity.
- Settings/BGM/SFX and face editor behavior.

## Hard constraints

- No new gameplay RNG.
- No MatchState schema change.
- No stale presentation on snapshot resync.
- Do not merge PR #1 or mark Ready without Ron explicitly asking.
