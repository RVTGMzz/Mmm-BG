# MeMeMe MVP 0.1.26 — Turn Stakes & Money Drama

Status: PLAYTEST PACKAGED / CI GREEN

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

## Validation

Validated GitHub Actions run: `34764306363` / run `#647`.

Artifact: `mememe-playtest-0.1.26`

Artifact digest: `sha256:208c864fb351d21f97813a5b22049faf9856f94f547ccf6fcf348bab4d4c2a35`

Artifact size: ~8.50 MB.

CI passed build/typecheck, replay, lockstep, host/client, authority, two-tab, CPU autoplay, presentation/flow, board movement/feel, Settings/audio, content, reaction/route, party mechanics, 200B economy, Turn Stakes, image and package checks.

## Hard constraints

- No new gameplay RNG.
- No MatchState schema change.
- No stale presentation on snapshot resync.
- Do not merge PR #1 or mark Ready without Ron explicitly asking.
