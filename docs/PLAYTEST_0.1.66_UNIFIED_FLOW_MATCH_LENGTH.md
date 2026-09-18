# MeMeMe MVP 0.1.66 — Unified Flow + Match Length

## Quick start

Windows: run **`START_PLAYTEST.bat`**. The two old Draft D preview/full-map launchers are intentionally no longer shipped.

Online/Steam Deck uses the same compiled runtime as the ZIP playtest.

## Test this build

1. **Pregame match length**
   - Setup shows **1 VÒNG / 2 VÒNG / 3 VÒNG**.
   - Default is 1.
   - A match must not finish until all players reach the chosen lap target.
2. **Job popup**
   - When the briefcase/Job icon is present, the redundant dice emoji must not overlap beside it.
   - Job Dice logic remains 1–2=A, 3–4=B, 5–6=C.
3. **Mini Game readability**
   - Tie screen heading and player-choice list must not overlap.
   - Ranking heading and payout rows must be clearly separated.
4. **Unified package**
   - Only `START_PLAYTEST.bat` should be present as a START_*.bat launcher.
5. **Retained regressions**
   - Camera remains centered on the actor still moving.
   - Odd D6 routes LEFT; even D6 routes RIGHT.
   - Job encountered mid-roll resumes remaining pips after resolving.
   - Landing effect/HUD money appears only after the token reaches the destination.
   - Jail/Hospital release still requires a fresh movement D6.
   - Card target selection hides the movement dice.
   - D-pad + A gamepad UI navigation remains active.

Manual status: **PENDING RON ACCEPTANCE**.

Do not merge PR #1.
