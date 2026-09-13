# MeMeMe MVP 0.1.32 — Runtime Clarity Polish

Status: ACTIVE / PLAYTEST PACKAGING

## Goal

Polish the first runtime feedback pass after the fully validated 0.1.31 Job Dice / Salary / Mini Game / Roll For Order milestone without changing gameplay authority, economy, RNG or rules.

## Roll For Order polish

- Final order now remains visible on each player's own card as `THỨ 1 / THỨ 2 / THỨ 3 / THỨ 4`.
- Stable player ID, face, color and CPU/human ownership still do not move.
- Only the existing authoritative `playOrder` changes.
- The final `VÀO TRẬN` button now uses the normal UI confirm SFX instead of replaying the dice-roll SFX.
- Tie reroll behavior is unchanged.

## Job Hub clarity

- The three random Job offers are now explicitly labeled `A`, `B`, `C`.
- The D6 mapping is repeated directly above the Job roll button:
  - `1–2 → A`
  - `3–4 → B`
  - `5–6 → C`
- Copy explicitly states that the die decides the Job and the cards are not direct-selection buttons.
- Salary curves, Job risk/progression data and authoritative Job D6 resolution are unchanged.
- The Job roll button disables immediately when accepted to guard presentation input against accidental duplicate pointer events.

## Packaged quickstart cleanup

The external `PLAYTEST.txt` was still carrying the old 0.1.16.2 title and controls. It is refreshed for 0.1.32 with:

- current direct-dice controls;
- Roll For Order instructions;
- Job Dice / salary behavior;
- Mini Game flow;
- current known limitations;
- Settings/BGM/FX note.

## Unchanged gameplay invariants

- Starting wallet remains `200 B$`.
- Job salary/economy data remains unchanged.
- Mini Game payout remains intentionally neutral.
- Jail movement/turn/bail/escape rules remain intentionally undefined.
- Presentation does not consume gameplay RNG.
- `eventLog` remains presentation-only and checksum-excluded.
- `playOrder`, Job state and pending Job offers remain checksum-covered.
- Snapshot resync must not replay stale presentation.
- Approved BGM files remain checksum-locked and are not re-encoded.
- CPU remains a QA bot, not final gameplay AI.
- PR #1 must not be merged or marked Ready without Ron's explicit instruction.

## Runtime playtest focus

1. Confirm final Roll For Order rank labels are immediately readable and stay attached to the correct player.
2. Confirm `VÀO TRẬN` no longer sounds like another dice roll.
3. Confirm Job Hub makes A/B/C and the D6 mapping understandable at a glance.
4. Confirm a Job can still only be awarded by the authoritative Job D6 path.
5. Smoke-test Mini Game, salary popup, direct dice, Settings/BGM and rematch.

## Packaging

Target artifact name:

`mememe-playtest-0.1.32`

A build should only become the new validated runtime checkpoint after the full CI matrix and package upload pass.
