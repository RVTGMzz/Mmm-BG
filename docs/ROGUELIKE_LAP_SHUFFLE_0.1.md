# Roguelike Lap Shuffle 0.1

Status: **IMPLEMENTED — RUNTIME RETEST REQUIRED**

This mechanic turns each completed lap into a board remix. The first player to cross the Start line for a new lap index becomes the trigger for one global, deterministic content shuffle.

## Rule

- Lap 1: the first player to cross Start triggers Shuffle #1.
- Lap 2: the first player to cross Start triggers Shuffle #2.
- Lap 3: the first player to cross Start triggers Shuffle #3.
- Later players reaching the same lap index do not trigger another shuffle.
- In a one-lap match, the first finisher still shuffles the board for players who have not finished yet.

## What moves

Only tile **content bundles** move.

A bundle includes:
- tile type;
- money value;
- feature type;
- content ID;
- resulting landing behaviour.

The following therefore move together correctly:
- TIN TỨC;
- LÁ BÀI;
- money gain/loss;
- Mini Game;
- Lottery;
- ordinary spaces.

Coordinates, node IDs, movement edges and branch topology never move.

## Locked positions

These positions never participate in the shuffle:
- Start;
- Job;
- Police/Jail gate;
- Jail hold;
- Jail Exit 1/2/3;
- Hospital gate;
- Hospital hold;
- Hospital Exit 1/2/3.

This keeps release corridors and special-location authority stable.

## Authority

Shuffle uses the existing serializable HOST RNG.

It never uses `Math.random()`.

The resulting content assignment is:
- stored in `MatchState`;
- included in gameplay checksum;
- serialized for reconnect/snapshot flow;
- reconstructed deterministically by replay.

This ensures Host/client/replay all see the same board.

## Trigger timing

The shuffle happens immediately when the first player crosses Start for a new lap.

If that player still has movement pips remaining in a multi-lap match, subsequent movement steps use the newly shuffled board.

A tile does not retroactively fire a new effect merely because its content changed while a token was already standing on it. Landing resolution still occurs only through the normal movement flow.

## Presentation

The authority event is:

`board_shuffle`

Visible presentation:
- global “BÀN CỜ ĐÃ BIẾN ĐỔI!” event;
- 🔀 identity;
- short board-shift burst/camera feedback;
- mutable board tiles visually flip/pop into their authoritative new identities.

The visual board is intentionally updated when the `board_shuffle` presentation beat reaches the screen, not immediately when authority finishes the roll. This prevents the new layout from appearing before the player sees the transformation event.

## Core implementation

- `src/core/lapShuffle071.ts`
- `src/core/matchState.ts`
- `src/core/checksum.ts`
- `src/core/replay.ts`
- `src/ui/presentationModel.ts`
- `src/ui/MatchPresentationLayer.ts`
- `src/scenes/CareerMinigameBoardScene07044.ts`

Regression gate:
- `tests/roguelike-lap-shuffle-071.ts`

The retained deterministic outlier fingerprints in `tests/outlier-replay-064.ts` are intentionally rebased because the new mechanic consumes HOST RNG and changes later landing outcomes.

## Runtime acceptance

Do not call Runtime PASS until real play confirms:

1. first player crossing Start triggers exactly one shuffle;
2. second/third/fourth player reaching the same lap does not reshuffle;
3. Job / Police / Hospital / six exit-corridor nodes remain fixed;
4. TIN TỨC / LÁ BÀI / money / Mini Game / Lottery visibly move;
5. landing effects match the new visible tile;
6. two online devices see the same shuffled layout;
7. reload/reconnect restores the same layout;
8. no player already standing on a tile receives a retroactive effect;
9. a multi-lap first player can continue remaining pips on the new layout.
