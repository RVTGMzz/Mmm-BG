# MeMeMe Playtest MVP 0.1.31

Focus: Roll For Order + Job Dice + Job Salary + Mini Games.

## 1. Roll For Order
1. From Setup, press `ROLL FOR ORDER`.
2. Each human should roll one die manually; CPU seats should roll automatically.
3. Higher rolls should appear earlier in the final order.
4. If two or more players tie, only that tied group should reroll.
5. Enter the match and confirm turns follow the displayed order while player colors/faces stay attached to the same person.

## 2. Mandatory Job Hub
1. Play until a token reaches Job Hub.
2. The token must stop on Job Hub even if the movement roll had remaining steps.
3. Exactly three random Job cards should appear.
4. Job cards must not be directly selectable.
5. Each card should show its mapping: `1–2`, `3–4`, or `5–6`, plus Lv.1/Lv.2/Lv.3 salary and a short trait.
6. Press `ĐỔ XÚC XẮC JOB`.
7. Confirm 1–2 awards A, 3–4 awards B, 5–6 awards C.
8. The displayed Job die must match the authoritative result and must not invent another roll.

## 3. Salary and career progression
1. After receiving a Job, complete another lap and pass Ready/start.
2. Confirm the popup says `LƯƠNG QUA CỔNG` and the money increase matches the current Job level salary.
3. On later Job Hub visits, confirm the existing career can promote, stay steady, demote, be fired, or trigger its risky special case.
4. If unemployed, passing the gate should pay `0 B$`.
5. Thief may enter jailed status; deeper jail turn rules are not part of this milestone yet.

## 4. Mini Games
1. Trigger Mini Game with 3–4 participants.
2. `Nhiều ra ít bị` should run repeated SẤP/NGỬA elimination rounds.
3. A tie should replay rather than eliminate anyone.
4. After the field reaches exactly two players, it must automatically switch to Rock-Paper-Scissors.
5. Rock-Paper-Scissors ties should replay until a final winner exists.
6. No B$ payout is expected yet from Mini Games.

## 5. Regression smoke test
- Direct Dice still works on normal turns.
- Parity route behavior remains deterministic.
- Card/News presentation still blocks/auto-closes according to existing audience rules.
- Settings still contains BGM volume/mute and FX mute.
- Menu/round/final BGM mapping remains unchanged.
- CPU autoplay should not deadlock on Job Hub.
- Rematch should reset career state while retaining a valid new-match flow.

## Known playtest limitation
For the current 2-tab prototype, Roll For Order is hosted from the host/local setup flow rather than collecting one remote die press from each browser. The resulting order is still preserved in authoritative match state and snapshots.
