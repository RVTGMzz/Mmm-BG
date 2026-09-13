# MeMeMe Playtest 0.1.29

## Main focus

This build introduces visible **Mini Game** and **Job** foundation spaces while deliberately keeping their final rules unimplemented.

Please check:

1. The board visibly contains a 🎮 Mini Game tile and a 💼 Job tile.
2. Landing on either produces one clear function-space notice, not two duplicate landing popups.
3. The notice explains that 0.1.29 is foundation-only and then returns to normal turn flow.
4. CPU/autoplay never stalls when landing on either function space.
5. No unexpected money/Card/News change happens just because the function tile was triggered.
6. Existing movement, dice, reactions, Settings, BGM and leaderboard still behave normally.

## Current placements

- Node 9: `MINIGAME_SLOT_01`
- Node 12: `JOB_SLOT_01`

These IDs are stable content hooks for the playable implementations planned next.

## Important

0.1.29 does **not** define the final Mini Game or Job rules. It only proves board identity, content schema, replay/authority routing, presentation hooks and CPU-safe auto-pass behavior.

## Next target

0.1.30: first playable Mini Game + first playable Job after their rules are explicitly locked.
