# MeMeMe Playtest MVP 0.1.32

Focus: runtime clarity polish on top of the fully validated 0.1.31 gameplay loop.

## 1. Roll For Order polish

1. Start a match and enter `ROLL FOR ORDER`.
2. Confirm every human seat still rolls manually and CPU seats roll automatically.
3. Confirm higher rolls rank earlier and only tied players reroll.
4. After order resolves, confirm every player card shows `THỨ 1`, `THỨ 2`, `THỨ 3`, or `THỨ 4`.
5. Confirm the rank stays attached to the correct player face/name/color rather than moving the player identity itself.
6. Press `VÀO TRẬN` and confirm it uses a normal confirm sound rather than another dice-roll sound.
7. Confirm the first board turn follows the displayed order.

## 2. Job Hub clarity

1. Reach the mandatory Job Hub while unemployed.
2. Confirm movement still stops at Job Hub even if the movement die had unused steps.
3. Confirm exactly three unique Job offers appear.
4. Confirm the cards are visibly labeled `A`, `B`, `C`.
5. Confirm the screen clearly repeats `1–2 → A`, `3–4 → B`, `5–6 → C`.
6. Confirm Job cards remain non-selectable.
7. Press `ĐỔ XÚC XẮC JOB` once.
8. Confirm the authoritative Job D6 presentation appears and awards the matching A/B/C Job.
9. Confirm rapid/double clicking does not submit the Job prompt twice.

## 3. Salary and career smoke test

1. After receiving a Job, pass Ready/start on a later lap.
2. Confirm `LƯƠNG QUA CỔNG` matches the current Job level salary.
3. Confirm an unemployed player still receives `0 B$`.
4. Confirm later Job Hub visits can still use the existing promotion / steady / demotion / fired / risky-special progression.
5. Do not expect deeper jail gameplay yet.

## 4. Mini Game smoke test

1. Trigger Mini Game with 3–4 participants.
2. Confirm `Nhiều ra ít bị` still eliminates the minority side and replays ties.
3. Confirm reaching exactly two players switches automatically to Oẳn Tù Xì.
4. Confirm RPS ties replay until a winner exists.
5. No Mini Game B$ payout is expected in this milestone.

## 5. Regression smoke test

- Direct Dice still appears only for the controllable human during `PRE_ROLL_ACTION`.
- Card can still be used before rolling when legal.
- Parity routing and node-by-node movement remain deterministic.
- Human-relevant presentation still waits for the human in 1P+3CPU while CPU-only notices auto-advance.
- NPC reaction bubbles remain left/right side chat rather than stacking under the center notice.
- Settings still exposes BGM mute/volume and FX mute.
- Menu/round/final BGM mapping remains unchanged.
- Rematch resets career state and produces a valid new match.
- CPU autoplay does not deadlock on Job Hub or Mini Game.

## Known limitations

- Current 2-tab Roll For Order is still hosted from the host/local setup flow rather than collecting one separate die press from every remote browser.
- Thief may enter `jailed`, but skipped turns / bail / escape are not defined yet.
- Mini Game reward/penalty economy is intentionally still neutral.
- CPU is a QA bot, not final gameplay AI.

## Hard invariants

- Do not merge PR #1 or mark it Ready unless Ron explicitly asks.
- Do not re-encode or substitute the approved BGM files.
- Do not add presentation RNG that perturbs gameplay RNG.
- Dice presentation must always show the authoritative result.
- Snapshot resync must not replay stale presentation.
- Result/ranking must wait for final presentation to clear.
