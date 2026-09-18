# MeMeMe — PLAYTEST 0.1.34

## Main focus

### One-lap HUD
- Start a normal 1 Human + 3 CPU match.
- Confirm the compact HUD says `HOÀN THÀNH 1 VÒNG • 0/4` at the beginning.
- It must not show the old fixed-round progress as the active match rule.

### B$ leaderboard lap status
- Before a player completes the required lap, their row should show `🏁0/1`.
- After that player crosses READY for the first time, the row should show `🏁✓`.
- B$ rank/order must remain determined by money, not by lap status.

### READY completion banner
- When a player completes the required first lap, expect a temporary banner:
  `🏁 <PLAYER> HOÀN THÀNH 1 VÒNG!`
- The detail line should show current table progress such as `1/4`, `2/4`, etc.
- The banner must not require manual acknowledgement.
- It should not change B$, dice results, node position, turn order or Job outcome.
- A snapshot/resync must not replay an already-consumed completion banner.

### Match-end rule
- The match must remain active while any player is still below one completed lap.
- When all players reach at least one completed lap, final B$ ranking may appear after pending presentation clears.
- Highest B$ wins; equal B$ remains shared win.

## Regression checks

- P1 movement remains visually stable after Card/News. No snap backward then fly forward.
- Direct dice still works on human turns.
- Job Hub still stops movement and assigns A/B/C by Job D6.
- Salary still pays at READY according to current Job + level.
- Unemployed crossing READY still counts the lap but salary is 0 B$.
- Mini Game still uses Nhiều ra ít bị, then RPS at 1v1.
- Settings BGM/FX controls still work.
- Rematch resets all `lapsCompleted` counters to 0.
- Roll For Order remains unchanged.

## Do not infer new rules

Still deliberately undefined:
- jail skipped-turn / bail / escape mechanics;
- Mini Game B$ rewards or penalties;
- deeper Job-specific mechanics beyond the existing career system.
