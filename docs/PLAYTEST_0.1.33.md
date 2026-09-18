# MeMeMe Playtest MVP 0.1.33

Focus: stable token motion and score only after every player completes one full board lap.

## 1. Token snap-back regression

Use 1 HUMAN + 3 CPU so P1 is easy to watch.

1. Roll and let P1 move several nodes.
2. Watch the token arrive at its final destination.
3. Trigger or wait for a Card / News / landing presentation before the next turn.
4. Repeat across several turns, especially after longer rolls.
5. Expected: P1 stays at the destination it visually reached.
6. There must be no brief snap to the pre-roll/earlier node and no second "fly forward" correction.
7. CPU tokens should also remain stable through presentation events.

Important distinction:
- movement animation may still bounce/squash on each step;
- the bug is specifically an incorrect jump to an old board node followed by a correction.

## 2. Snapshot / rematch safety

1. Complete some movement.
2. If testing two tabs, force/observe a snapshot resync.
3. Confirm snapshot places tokens directly on the authoritative nodes.
4. Start a rematch.
5. Confirm all tokens return to Ready/start correctly.
6. Confirm normal Card/News state updates do not hard-snap token coordinates.

## 3. One-lap scoring rule

New rule for this build:

**All players must complete one full board lap before final B$ scoring.**

1. Start a normal match.
2. Observe the compact HUD: `HOÀN THÀNH 1 VÒNG • X/4`.
3. Play past the old 12-turn / 3-round boundary if necessary.
4. Expected: the match must NOT end just because a fixed number of turns has passed.
5. Each player increments lap progress when crossing Ready/start.
6. After P1 finishes one lap while another player has not, the match must continue.
7. Only after all four players have crossed Ready at least once may the result screen appear.
8. Winner = highest B$ at that moment.
9. Equal B$ = shared win.

## 4. Ready + salary interaction

Crossing Ready now does two things in the same authoritative movement step:
- increments `lapsCompleted`;
- pays current Job salary, or `0 B$` if unemployed.

Check:
1. employed player crossing Ready receives the correct Job/level salary;
2. lap count increases exactly once for that crossing;
3. unemployed player receives 0 B$ but still completes the lap;
4. landing on/going through Ready must not double-count a lap.

## 5. Rematch reset

After results:
1. choose rematch;
2. all players must return to `lapsCompleted = 0`;
3. wallets reset to starting money;
4. careers / pending prompts reset through the normal fresh-match path;
5. scoring cannot immediately reappear from old lap progress.

## 6. General smoke test

- Roll For Order still works and displays THỨ 1/2/3/4.
- Direct dice remains clickable only on the human controllable turn.
- Job Hub A/B/C and `1–2 / 3–4 / 5–6` mapping still work.
- Job Dice still decides the career authoritatively.
- Mini Game still reaches RPS at 1v1.
- Card/News/reactions still do not perturb gameplay RNG.
- Settings, BGM, SFX and rematch still work.

## Known deferred rules

- Jail skipped-turn / bail / escape behavior is still undefined.
- Mini Game B$ reward/penalty is still undefined.
- CPU remains a QA bot rather than final gameplay AI.

## Hard invariants

- Do not merge PR #1 unless explicitly requested.
- Do not re-encode/substitute approved BGM.
- `lapsCompleted` must remain checksum-covered.
- Presentation eventLog remains checksum-excluded.
- Normal state packets must not steal token-coordinate ownership from move-step presentation.
- Snapshot/rematch must still be able to restore authoritative token positions.
